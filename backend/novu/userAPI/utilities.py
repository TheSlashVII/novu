import uuid, os
from pathlib import Path

BASE_URL=Path(__file__).resolve().parent.parent # project root
"""
Function made to reduce code written and to generate random image names
"""
def generateNewName(model, file:str):
    fileExtension=file.split('.')[-1] # gets the file extension by searching the first set of letters after the last '.'
    newRandomFileName=f"{uuid.uuid4()}.{fileExtension}" # generates a new random UUID as a name for the file
    return newRandomFileName
# renames the user files
def fileRename(model, file:str):
    newname=generateNewName(model, file)
    return f'photos/user/{newname}'
# renames files for register requests
def fileRenameRegister(model, file:str):
    newname=generateNewName(model, file)
    return f'register_request/{newname}'