echo "Creating Docker Image"
docker build -t 'compile-box' - < Dockerfile
echo "Retrieving Installed Docker Images"
docker images