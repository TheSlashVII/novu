import uuid, os
from pathlib import Path

BASE_URL=Path(__file__).resolve().parent.parent # project root
def fileRename(model, file:str, isRegister:bool):
    if isRegister:
        fileExtension=file.split('.')[-1] # gets the file extension by searching the first set of letters after the last '.'
        newname=f"{uuid.uuid4}.{fileExtension}" # generates a new random UUID as a name for the file
        return os.path.join(f'{BASE_URL}/photos/register_request', newname)
    return os.path.join(f'{BASE_URL}/photos/user', newname)

    

