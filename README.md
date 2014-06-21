Influence Documentations
===

- Setup
---

1. Software to download before you start:
    - [Vagrant](http://www.vagrantup.com/downloads.html)
    - [VirtualBox](https://www.virtualbox.org/wiki/Downloads)
    - IDE ([Webstorm](http://www.jetbrains.com/webstorm/download/) if you don't have a preference)
        - markdown plugin
    - [Chrome Canary](http://www.google.com/intl/en/chrome/browser/canary.html) (Not required, you can use anyone that you like)
    - Git (Github tool) [See here](https://help.github.com/articles/set-up-git)
    
2. Setup Github access so you can download all the files that includes VagrantFile for the environment and the source code 
3. Setup your workspace
    - Find the place you want to get the remote repo, say ~dev\
    - Run `github clone git@github.com:benzhou/influence.git` to get the remote repository downloaded
    - Run `Vagrant up` to start the process of building up your development environment, essentially this process will 
        1. Download the virtual machine that is defined in the VagrantFile
        2. the bootstrap.sh is the Vagrant provision file we defined in the VagrantFile, therefore, it will be executed as well. 
    - In VagrantFile, because we've configured as 'config.vm.synced_folder "sites-available", "/etc/nginx/sites-available"', therefore default nginx site configuration will point to the 
      site-available folder in the vagrant folder. This prevents in the 'vagrant up' step, nginx being able to installed successfully. If you have this issue, please run 'vagrant ssh' to connect
      the virtual box just installed by 'vagrant up' and run 'sudo apt-get install nginx' again. You will be asked if use the sites-availabel folder defined by you.  
    - Once the above steps are completed, Congratulations, you've completed the setup process pretty much.
    
- Topics
---
    - Flow Control with promises and Q library. 
    - Error Handling