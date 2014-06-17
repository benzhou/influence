var webdriver = require('selenium-webdriver');
var SeleniumServer = require('selenium-webdriver/remote').SeleniumServer;

var server = new SeleniumServer('selenium-server-standalone-2.41.0.jar', {port: 4444});

server.start().then(function(){console.log('server started!')});

var driver = new webdriver.Builder().usingServer(server.address()).withCapabilities(webdriver.Capabilities.chrome()).build();

driver.get('http://www.google.com').then(function(){console.log('page loaded');});

var element = driver.findElement(webdriver.By.name('q'));
element.sendKeys('Cheese!');
element.submit();

driver.getTitle().then(function(title) {
  console.log('Page title is: ' + title);
});

driver.wait(function() {
  return driver.getTitle().then(function(title) {
    return title.toLowerCase().lastIndexOf('cheese!', 0) === 0;
  });
}, 3000);

driver.getTitle().then(function(title) {
  console.log('Page title is: ' + title);
});

driver.quit();