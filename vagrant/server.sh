#!/usr/bin/env bash

forever start -l /vagrant/site/influence/logs/forever.log -o /vagrant/site/influence/logs/out.log -e /vagrant/site/influence/logs/err.log /vagrant/site/influence/bin/www