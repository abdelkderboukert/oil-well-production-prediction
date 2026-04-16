#!/bin/bash

CONTAINER_NAME="oil-gas-postgres"

# 1. Check if the container exists (regardless of status)
if [ "$(docker ps -aq -f name=^/${CONTAINER_NAME}$)" ]; then
    
    # 2. Check if the container is already running
    if [ "$(docker ps -q -f name=^/${CONTAINER_NAME}$)" ]; then
        echo "Container '$CONTAINER_NAME' is already running."
    else
        echo "Container '$CONTAINER_NAME' exists but is stopped. Starting it now..."
        docker start $CONTAINER_NAME
    fi

else
    # 3. Create and run the container for the first time
    echo "Container '$CONTAINER_NAME' does not exist. Creating it..."
    docker run --name $CONTAINER_NAME \
      -e POSTGRES_PASSWORD=mysecretpassword \
      -v postgres_data:/var/lib/postgresql/data \
      -p 5432:5432 \
      -d postgres
fi