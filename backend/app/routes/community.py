from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone
from app.models import db, Post, Comment, Vote, User

community_bp = Blueprint('community', __name__, url_prefix='/api/community')

@community_bp.route('/posts', methods=['GET'])
@jwt_required(optional=True)
def get_posts():
    tag = request.args.get('tag')
    search = request.args.get('search', '').strip().lower()
    
    current_user_id = get_jwt_identity()
    if current_user_id:
        current_user_id = int(current_user_id)

    query = Post.query
    if tag and tag.lower() != 'all':
        query = query.filter_by(tag=tag)
    if search:
        query = query.filter(Post.title.ilike(f'%{search}%') | Post.content.ilike(f'%{search}%'))

    posts = query.order_by(Post.created_at.desc()).all()
    return jsonify({
        'posts': [p.to_dict(current_user_id=current_user_id) for p in posts]
    }), 200


@community_bp.route('/posts', methods=['POST'])
@jwt_required()
def create_post():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    title = data.get('title', '').strip()
    content = data.get('content', '').strip()
    tag = data.get('tag', 'General')

    if not title or not content:
        return jsonify({'error': 'Title and content are required'}), 400

    post = Post(
        user_id=user_id,
        title=title,
        content=content,
        tag=tag,
        upvotes_count=1,
        created_at=datetime.now(timezone.utc)
    )
    db.session.add(post)
    db.session.flush()

    # Self-upvote
    vote = Vote(post_id=post.id, user_id=user_id, vote_type='up')
    db.session.add(vote)
    db.session.commit()

    return jsonify({
        'message': 'Post published successfully',
        'post': post.to_dict(current_user_id=user_id)
    }), 201


@community_bp.route('/posts/<int:post_id>/vote', methods=['POST'])
@jwt_required()
def vote_post(post_id):
    user_id = int(get_jwt_identity())
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'error': 'Post not found'}), 404

    existing_vote = Vote.query.filter_by(post_id=post.id, user_id=user_id).first()
    if existing_vote:
        # Toggle off
        db.session.delete(existing_vote)
        post.upvotes_count = max(0, post.upvotes_count - 1)
        has_upvoted = False
    else:
        vote = Vote(post_id=post.id, user_id=user_id, vote_type='up')
        db.session.add(vote)
        post.upvotes_count += 1
        has_upvoted = True

    db.session.commit()
    return jsonify({
        'upvotes_count': post.upvotes_count,
        'has_upvoted': has_upvoted
    }), 200


@community_bp.route('/posts/<int:post_id>/comments', methods=['GET'])
def get_comments(post_id):
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'error': 'Post not found'}), 404

    comments = post.comments.all()
    return jsonify({'comments': [c.to_dict() for c in comments]}), 200


@community_bp.route('/posts/<int:post_id>/comments', methods=['POST'])
@jwt_required()
def add_comment(post_id):
    user_id = int(get_jwt_identity())
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'error': 'Post not found'}), 404

    data = request.get_json() or {}
    content = data.get('content', '').strip()
    if not content:
        return jsonify({'error': 'Comment content cannot be empty'}), 400

    comment = Comment(
        post_id=post.id,
        user_id=user_id,
        content=content,
        created_at=datetime.now(timezone.utc)
    )
    db.session.add(comment)
    db.session.commit()

    return jsonify({
        'message': 'Comment added',
        'comment': comment.to_dict()
    }), 201
