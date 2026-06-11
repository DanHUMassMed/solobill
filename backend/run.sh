#!/bin/bash
source activate_project
uvicorn app.main:app --reload --port 7777