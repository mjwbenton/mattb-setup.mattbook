#!zsh -e
mkdir -p ~/.aws/
ln -s /Volumes/private/awscredentials ~/.aws/credentials
mkdir -p ~/.ssh/
ln -s /Volumes/private/ssh/config ~/.ssh/config
ln -s /Volumes/private/ssh/id_rsa ~/.ssh/id_rsa
ln -s /Volumes/private/ssh/id_rsa.pub ~/.ssh/id_rsa.pub
