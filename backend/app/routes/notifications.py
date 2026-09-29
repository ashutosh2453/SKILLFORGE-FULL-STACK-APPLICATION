from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone, timedelta
from app.models import db, Notification

notifications_bp = Blueprint('notifications', __name__, url_prefix='/api/notifications')

@notifications_bp.route('', methods=['GET'])
@jwt_required()
def get_notifications():
    user_id = int(get_jwt_identity())
    notifs = Notification.query.filter_by(user_id=user_id).order_by(Notification.created_at.desc()).all()

    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    
    today_list = []
    earlier_list = []

    for n in notifs:
        n_dict = n.to_dict()
        if n.created_at and n.created_at.replace(tzinfo=timezone.utc) >= today_start:
            today_list.append(n_dict)
        else:
            earlier_list.append(n_dict)

    unread_count = sum(1 for n in notifs if not n.read)

    return jsonify({
        'today': today_list,
        'earlier': earlier_list,
        'unread_count': unread_count,
        'total_count': len(notifs)
    }), 200


@notifications_bp.route('/<int:notif_id>/read', methods=['POST'])
@jwt_required()
def mark_read(notif_id):
    user_id = int(get_jwt_identity())
    notif = Notification.query.filter_by(id=notif_id, user_id=user_id).first()
    if notif:
        notif.read = True
        db.session.commit()
    return jsonify({'message': 'Notification marked as read'}), 200


@notifications_bp.route('/read-all', methods=['POST'])
@jwt_required()
def mark_all_read():
    user_id = int(get_jwt_identity())
    Notification.query.filter_by(user_id=user_id, read=False).update({'read': True})
    db.session.commit()
    return jsonify({'message': 'All notifications marked as read'}), 200
