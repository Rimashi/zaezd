.PHONY: setup run check

setup:
	python -m venv .venv
	. .venv/bin/activate && python -m pip install --upgrade pip && pip install -r requirements.txt

run:
	. .venv/bin/activate && uvicorn app.main:app --reload

check:
	. .venv/bin/activate && python -m compileall -q app
