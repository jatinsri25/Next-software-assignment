from modules.comment.internal.store.comment_model import CommentModel
from modules.comment.types import Comment


class CommentUtil:
    @staticmethod
    def convert_comment_bson_to_comment(comment: dict | CommentModel) -> Comment:
        if isinstance(comment, CommentModel):
            comment_model = comment
        else:
            comment_model = CommentModel.from_bson(comment)

        return Comment(
            id=str(comment_model.id),
            account_id=comment_model.account_id,
            task_id=comment_model.task_id,
            content=comment_model.content,
            created_at=comment_model.created_at,
            updated_at=comment_model.updated_at,
        )
