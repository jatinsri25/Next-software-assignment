# Walkthrough - Better Software Assessment

## Task 1: Backend APIs for Comments
I have implemented a new `comment` module in the backend functionality to handle CRUD operations for task comments.

### Changes
- **New Module**: `src/apps/backend/modules/comment`
  - `types.py`: defined `Comment` and parameter data classes.
  - `internal/store/comment_model.py`: MongoDB model definition.
  - `internal/store/comment_repository.py`: Repository for DB access.
  - `internal/comment_writer.py`: Business logic for Creating, Updating, Deleting comments.
  - `internal/comment_reader.py`: Business logic for Reading comments.
  - `comment_service.py`: Service facade.
  - `rest_api/comment_view.py` and `comment_router.py`: API endpoints.
- **Server Registration**: Updated `src/apps/backend/server.py` to register the new `comment` blueprint.
- **Tests**: Added `tests/modules/comment/test_comment_api.py` covering all CRUD operations.

### Verification
- **Automated Tests**: Ran `pytest` on `tests/modules/comment/test_comment_api.py`.
  - Result: 7 tests passed.
  - Coverage: Create, generic Get, Update, Delete, NotFound handling.

## Task 2: Frontend for Tasks (Bonus)
I have implemented the frontend interface to manage (Add, Edit, Delete) tasks.

### Changes
- **Task Service**: `src/apps/frontend/services/task.service.ts` refactored to use standard `ApiResponse` pattern and arrow functions, matching `AuthService` style.
- **Tasks Page**: `src/apps/frontend/pages/tasks/TasksPage.tsx` displaying the list of tasks using `try/catch` error handling standard to the codebase.
- **Components**:
  - `TaskList.tsx`: Grid view of tasks.
  - `TaskForm.tsx`: Modal form for Create/Edit.
- **Types**: Added `src/apps/frontend/types/task.ts` to define `Task` class handling JSON-to-CamelCase transformation.
- **Routing**: Added `/tasks` route in `src/apps/frontend/routes/protected.tsx`.

### Key Decisions
- **Architecture**: Followed the existing Domain-Driven Design (DDD) pattern in the backend (`modules/task` -> `modules/comment`) and Service/Component pattern in frontend.
- **Tech Stack**: Used `pydantic` dataclasses (frozen) for type safety in backend and `TypeScript` interfaces in frontend.
- **Compatibility**: Upgraded to Python 3.12 syntax (via local toolchain) to match existing codebase patterns (Union types `|`).

## Trade-offs
- **Frontend Tests**: Focused on static verification (Lint/Build) for frontend due to environment constraints. Manual verification is assumed via UI interaction (e.g., /tasks route).
- **Comments UI**: Focused frontend implementation on "Task" management as per the primary bonus requirement. Comments UI logic is prepared in backend but not fully exposed in frontend UI to keep scope manageable within the assessment timeframe.

## How to Run
1. **Backend**:
   ```bash
   pipenv install
   make run-engine
   ```
2. **Frontend**:
   ```bash
   npm install
   npm run serve:frontend
   ```
3. **Tests**:
   ```bash
   make run-test
   ```
