from flask import Blueprint

from modules.comment.rest_api.comment_view import CommentView, CommentDetailView


class CommentRestApiServer:
    @staticmethod
    def create() -> Blueprint:
        blueprint = Blueprint("comment", __name__)

        comment_view = CommentView.as_view("comment_view")
        comment_detail_view = CommentDetailView.as_view("comment_detail_view")

        blueprint.add_url_rule(
            "/accounts/<string:account_id>/tasks/<string:task_id>/comments",
            view_func=comment_view,
            methods=["GET", "POST"],
        )
        blueprint.add_url_rule(
            "/accounts/<string:account_id>/comments/<string:comment_id>",
            view_func=comment_detail_view,
            methods=["PATCH", "DELETE"],
        )

        return blueprint
