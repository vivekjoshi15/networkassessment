var logService = angular.module('apicemApp.logService', []);


logService.service('log', function ($http, $rootScope,$window) {
	var UserId=0;
	if($window.sessionStorage['user'] != null)
	{
		$rootScope.user =JSON.parse($window.sessionStorage['user']);
		if($rootScope.user != null){
			UserId= parseInt($rootScope.user.id);
		}
	}
	
    var log = function (msg,show) {
    	var  show = show || true;
    	if(show)
    		console.log(msg);
    	
       var httpHeaders=$http.defaults.headers;
	   httpHeaders.common['Authorization'] = 'Basic YWRtaW46dGVzdDEyMw==';
	   
	   var data = {
				"message" : msg,
				"type" : "log",
				"userId" : UserId
			};
	   
    	$http.post('api/self/logs',data)
	        .success(function (data) {
	        	
	        })
	        .error(function (data) {
	        	
	        });
    }
    
    var warn = function (msg,show) {
    	var  show = show || true;
    	if(show)
    		console.warn(msg);
    	
    	var httpHeaders=$http.defaults.headers;
	    httpHeaders.common['Authorization'] = 'Basic YWRtaW46dGVzdDEyMw==';
	    var data = {
				"message" : msg,
				"type" : "warn",
				"userId" : UserId
			};
	    
    	$http.post('api/self/logs',data)
	        .success(function (data) {
	        	
	        })
	        .error(function (data) {
	        	
	        });
    }
    
    var info = function (msg,show) {

    	var  show = show || true;
    	if(show)
    		console.info(msg);
    	
    	var httpHeaders=$http.defaults.headers;
	    httpHeaders.common['Authorization'] = 'Basic YWRtaW46dGVzdDEyMw==';
	    var data = {
				"message" : msg,
				"type" : "info",
				"userId" : UserId
			};
	    
    	$http.post('api/self/logs',data)
	        .success(function (data) {
	        	
	        })
	        .error(function (data) {
	        	
	        })
    }

    var error = function (msg,show) {
    	var  show = show || true;
    	if(show)
    		console.error(msg);
    	var data = {
				"message" : msg,
				"type" : "error",
				"userId" : UserId
			};
    	
    	$http.post('api/self/logs',data)
	        .success(function (data) {
	        	
	        })
	        .error(function (data) {
	        	
	        });
    }

    var debug = function (msg,show) {
    	var  show = show || true;
    	if(show)
    		console.debug(msg);
    	var data = {
				"message" : msg,
				"type" : "debug",
				"userId" : UserId
			};
    	
    	$http.post('api/self/logs',data)
	        .success(function (data) {
	        	
	        })
	        .error(function (data) {
	        	
	        });
    }

    return {
    	log:log,
    	warn: warn,
    	info: info,
    	error: error,
    	debug: debug
    };
});