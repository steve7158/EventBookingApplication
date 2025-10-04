from app.database.session import Base, engine
from app.models.user import User  # noqa
from app.models.event import Event  # noqa

def init_db():
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    init_db()
