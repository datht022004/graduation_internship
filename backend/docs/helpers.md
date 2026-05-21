# Helpers

`app/helpers` chứa tiện ích dùng chung.

## Files

| File | Vai trò |
|------|---------|
| `crud.py` | Base CRUD repository generic cho MongoDB |
| `security.py` | Hash và verify password |
| `rate_limit.py` | SlowAPI limiter |
| `seed.py` | Seed demo data khi app startup |

## `security.py`

Function:

- `hash_password(password)`
- `verify_password(plain_password, hashed_password)`

Backend dùng passlib bcrypt.

## `rate_limit.py`

Export:

```python
limiter = Limiter(key_func=get_remote_address)
```

Dùng trong auth controller:

- Login: `10/minute`
- Register: `5/minute`
- Google login: `10/minute`

## `seed.py`

Function:

```python
seed_demo_data()
```

Hiện tại:

- Drop các collection cũ không còn dùng.
- Seed default blog posts.
- Seed default categories.

Default admin/user được seed trong:

```text
app/manager/auth/usecase.py
```

## `crud.py`

Base repository generic. File này có thể dùng lại khi thêm module mới, nhưng nhiều repository hiện tại đang tự viết method rõ theo collection.
