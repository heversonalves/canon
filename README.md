
  # CANON

  This is a code bundle for CANON. The original project is available at https://www.figma.com/design/VmAMcNbpI0NWrGsBRLuNqn/CANON.

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

## Backend (Python)

The backend provides persistence for translations, notes, homiletics, and curation data.

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload
```

Set `VITE_API_URL` in the frontend environment to point at the backend, e.g. `http://localhost:8000`.


## Resolving merge conflict marker errors

If GitHub shows conflicts (e.g. `<<<<<<<`, `=======`, `>>>>>>>`) run:

```bash
npm run check:conflicts
```

If markers are found, edit the listed files and keep only the final code, then run the check again until it passes.

