FROM controlia:latest

# Set default values for USER_ID and GROUP_ID
ARG USERNAME='ravi'
ARG USER_UID=1000
ARG USER_GID=1000

# Create the user and group
RUN groupmod --gid $USER_GID $USERNAME \
    && usermod --uid $USER_UID --gid $USER_GID $USERNAME \
    && chown -R $USER_UID:$USER_GID /home/$USERNAME \
    && usermod -aG sudo USERNAME

# Create the directory and set permissions
RUN mkdir -p /$USERNAME/data && chown -R $USERNAME:$USERNAME /$USERNAME/data

# Switch to the USERNAME
USER $USERNAME

# Set the working directory
WORKDIR /$USERNAME/data

# Keep the container running
CMD ["sh", "-c", "while :; do sleep 2073600; done"]
