import json
from server import app

from modules.authentication.types import AccessTokenErrorCode
from modules.comment.types import CommentErrorCode, Comment
from modules.comment.internal.store.comment_repository import CommentRepository
from modules.comment.comment_service import CommentService
from modules.comment.types import CreateCommentParams
from tests.modules.task.base_test_task import BaseTestTask
from modules.logger.logger_manager import LoggerManager
from modules.comment.rest_api.comment_router import CommentRestApiServer


class BaseTestComment(BaseTestTask):
    DEFAULT_COMMENT_CONTENT = "This is a test comment"

    def setUp(self) -> None:
        super().setUp()
        # Ensure comment blueprint is registered if not already (it is in server.py but for safety in tests)
        # Actually server.py is imported so it should be fine. 
        # But we might need to mount logger again if super setup does it.
        pass

    def tearDown(self) -> None:
        super().tearDown()
        CommentRepository.collection().delete_many({})

    def get_comment_model_url(self, account_id: str, task_id: str) -> str:
        return f"http://127.0.0.1:8080/api/accounts/{account_id}/tasks/{task_id}/comments"

    def get_comment_detail_url(self, account_id: str, comment_id: str) -> str:
        return f"http://127.0.0.1:8080/api/accounts/{account_id}/comments/{comment_id}"

    def create_test_comment(self, account_id: str, task_id: str, content: str = None) -> Comment:
        return CommentService.create_comment(
            params=CreateCommentParams(
                account_id=account_id,
                task_id=task_id,
                content=content or self.DEFAULT_COMMENT_CONTENT,
            )
        )
    
    def make_comment_request(self, method: str, url: str, token: str, data: dict = None):
        headers = {**self.HEADERS, "Authorization": f"Bearer {token}"}
        with app.test_client() as client:
            if method.upper() == "GET":
                return client.get(url, headers=headers)
            elif method.upper() == "POST":
                return client.post(url, headers=headers, data=json.dumps(data) if data is not None else None)
            elif method.upper() == "PATCH":
                return client.patch(url, headers=headers, data=json.dumps(data) if data is not None else None)
            elif method.upper() == "DELETE":
                return client.delete(url, headers=headers)


class TestCommentApi(BaseTestComment):
    def test_create_comment_success(self) -> None:
        account, token = self.create_account_and_get_token()
        task = self.create_test_task(account.id)
        comment_data = {"content": self.DEFAULT_COMMENT_CONTENT}
        
        url = self.get_comment_model_url(account.id, task.id)
        response = self.make_comment_request("POST", url, token, data=comment_data)

        assert response.status_code == 201
        assert response.json["content"] == self.DEFAULT_COMMENT_CONTENT
        assert response.json["task_id"] == task.id
        assert response.json["account_id"] == account.id

    def test_create_comment_missing_content(self) -> None:
        account, token = self.create_account_and_get_token()
        task = self.create_test_task(account.id)
        comment_data = {}
        
        url = self.get_comment_model_url(account.id, task.id)
        response = self.make_comment_request("POST", url, token, data=comment_data)

        self.assert_error_response(response, 400, CommentErrorCode.BAD_REQUEST)

    def test_get_comments_success(self) -> None:
        account, token = self.create_account_and_get_token()
        task = self.create_test_task(account.id)
        self.create_test_comment(account.id, task.id, "Comment 1")
        self.create_test_comment(account.id, task.id, "Comment 2")

        url = self.get_comment_model_url(account.id, task.id)
        response = self.make_comment_request("GET", url, token)

        assert response.status_code == 200
        self.assert_pagination_response(response.json, expected_items_count=2, expected_total_count=2)
        assert response.json["items"][0]["content"] == "Comment 2" # Sorted by created_at desc

    def test_update_comment_success(self) -> None:
        account, token = self.create_account_and_get_token()
        task = self.create_test_task(account.id)
        comment = self.create_test_comment(account.id, task.id)
        update_data = {"content": "Updated Comment"}

        url = self.get_comment_detail_url(account.id, comment.id)
        response = self.make_comment_request("PATCH", url, token, data=update_data)

        assert response.status_code == 200
        assert response.json["content"] == "Updated Comment"

    def test_delete_comment_success(self) -> None:
        account, token = self.create_account_and_get_token()
        task = self.create_test_task(account.id)
        comment = self.create_test_comment(account.id, task.id)

        url = self.get_comment_detail_url(account.id, comment.id)
        delete_response = self.make_comment_request("DELETE", url, token)

        assert delete_response.status_code == 204

        # Verify deletion
        # Note: We don't have get_comment (single) API exposed for task comments specifically in the requirements, 
        # but we can list comments ensuring it's gone
        list_url = self.get_comment_model_url(account.id, task.id)
        list_response = self.make_comment_request("GET", list_url, token)
        assert list_response.json["total_count"] == 0

    def test_update_comment_not_found(self) -> None:
        account, token = self.create_account_and_get_token()
        url = self.get_comment_detail_url(account.id, "507f1f77bcf86cd799439011")
        response = self.make_comment_request("PATCH", url, token, data={"content": "foo"})
        self.assert_error_response(response, 404, CommentErrorCode.NOT_FOUND)

    def test_delete_comment_not_found(self) -> None:
        account, token = self.create_account_and_get_token()
        url = self.get_comment_detail_url(account.id, "507f1f77bcf86cd799439011")
        response = self.make_comment_request("DELETE", url, token)
        self.assert_error_response(response, 404, CommentErrorCode.NOT_FOUND)
