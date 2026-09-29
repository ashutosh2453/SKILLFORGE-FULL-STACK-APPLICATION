from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Badge, UserBadge

achievements_bp = Blueprint('achievements', __name__, url_prefix='/api/achievements')

@achievements_bp.route('', methods=['GET'])
@jwt_required()
def get_achievements():
    user_id = int(get_jwt_identity())
    badges = Badge.query.all()
    user_badges = UserBadge.query.filter_by(user_id=user_id).all()
    unlocked_map = {ub.badge_id: ub.unlocked_at.isoformat() for ub in user_badges}

    result = []
    total_points = 0
    unlocked_points = 0

    for b in badges:
        is_unlocked = b.id in unlocked_map
        total_points += b.points
        if is_unlocked:
            unlocked_points += b.points

        b_dict = b.to_dict()
        b_dict['unlocked'] = is_unlocked
        b_dict['unlocked_at'] = unlocked_map.get(b.id)
        result.append(b_dict)

    return jsonify({
        'achievements': result,
        'total_badges': len(badges),
        'unlocked_count': len(user_badges),
        'total_points': total_points,
        'unlocked_points': unlocked_points
    }), 200
