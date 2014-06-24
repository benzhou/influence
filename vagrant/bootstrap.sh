#!/usr/bin/env bash

sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/mongodb.list
sudo apt-get update
sudo apt-get install nginx -y
sudo apt-get install mongodb-org -y
sudo apt-get install nodejs -y
sudo ln -s /usr/bin/nodejs /usr/bin/node
sudo apt-get install npm -y
sudo npm install -g express
sudo npm install -g express-generator
sudo npm install -g forever
sudo npm install -g mocha
cd /vagrant/site/influence
npm install
