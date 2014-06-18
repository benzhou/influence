#!/usr/bin/env bash

forever start -a -l /vagrant/logs/forever.log -o /vagrant/logs/out.log -e /vagrant/logs/err.log /vagrant/site/influence/bin/www
