        // Dockerfile content
        const dockerfileContent = `
            FROM controlia:latest

            # Set default values for USER_ID and GROUP_ID
            ARG USERNAME=${userId}
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
        `;

        // File path for Dockerfile
        const dockerfilePath = path.join(__dirname, 'Dockerfile');

        // Write Dockerfile content to file
        fs.writeFileSync(dockerfilePath, dockerfileContent);

        console.log('Dockerfile written successfully');

        // Build Docker image
        const buildStream = await docker.buildImage({
            context: __dirname,
            src: ['Dockerfile'],
            buildargs: { USER_ID: 1000, GROUP_ID: 1000 }, 
        }, { t: `controlia_${userId}:latest` });

        // Monitor build progress
        buildStream.on('data', function (chunk) {
            const data = chunk.toString('utf8');
            console.log(data); // Log build output
        });

        // Wait for build to complete
        await new Promise((resolve, reject) => {
            docker.modem.followProgress(buildStream, (err, res) => err ? reject(err) : resolve(res));
        });

        // Remove temporary Dockerfile
        fs.unlinkSync(dockerfilePath);
