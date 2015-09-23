//Define a function scope, variables used inside it will NOT be globally visible.
(function () {

    var
            //the HTTP headers to be used by all requests
            httpHeaders,
            //the message to be shown to the user
            message,
            //Define the main module.
            //The module is accessible everywhere using "angular.module('angularspring')", therefore global variables can be avoided totally.
            as = angular.module('apicemApp', ['ngRoute', 'ngResource', 'ngTagsInput', 'ngCookies', 'ui.bootstrap', 'ngMessages', 'apicemApp.i18n', 'apicemApp.services', 'apicemApp.controllers','apicemApp.users','apicemApp.devices', 'apicemApp.filters', 'smart-table', 'angularUtils.directives.dirPagination', 'ui.select', 'xeditable', 'apicemApp.userService','apicemApp.logService']);

    as.config(function ($routeProvider, $httpProvider) {
    	
    	$httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
        //configure the rounting of ng-view
        $routeProvider
                .when('/',
                        {templateUrl: 'partials/login.html',
                            publicAccess: true})
                .when('/login',
                        {templateUrl: 'partials/login.html',
                        publicAccess: true
                        })
                .when('/forgot',
                        {
                            controller: 'ForgotController',
                            templateUrl: 'partials/forgot.html',
                            publicAccess: true
                        })
                .when('/signup',
                        {
                            controller: 'SignUpController',
                            templateUrl: 'partials/signup.html',
                            publicAccess: true
                        })
                .when('/userdetail',
                         {
                            controller: 'UserDetailController',
                            templateUrl: 'partials/user-detail.html'
                          })
                .when('/users',
                        {
                            controller: 'UsersController',
                            templateUrl: 'partials/users.html',
                        })
                .when('/apicemlogin',
                		 {controller: 'ApicEMLoginController',
            		 templateUrl: 'partials/em/apicem-login.html'})
            	.when('/apicemnew',
                		 {controller: 'ApicEMLoginController',
            		 templateUrl: 'partials/em/apicem-new.html'})	 
                .when('/device/:type/:platformId*',
                        {controller: 'ReplaceCtrl',
                		 templateUrl: 'partials/em/replace.html'})   
                .when('/product/:qty/bom/:productId*',
                        {controller: 'BomCtrl',
                		 templateUrl: 'partials/em/bom.html'})   
                .when('/products/:count/:type/:platformId*',
                        {controller: 'QuestionCtrl',
                		 templateUrl: 'partials/em/questionare.html'})
                .when('/devices',
                		{controller: 'SearchController',
                			templateUrl: 'partials/em/search.html'})
                .when('/manageexcel',
                         {controller: 'ApicExcelController',
                       		 templateUrl: 'partials/em/manage-excel.html'});    

        //configure $http to catch message responses and show them
        $httpProvider.interceptors.push(function ($q) {
            var setMessage = function (response) {
                //if the response has a text and a type property, it is a message to be shown
                if (response.data.text && response.data.type) {
                    message = {
                        text: response.data.text,
                        type: response.data.type,
                        show: true
                    };
                }
            };

            return {
                //this is called after each successful server request
                'response': function (response) {
                    // console.log('request:' + response);
                    setMessage(response);
                    return response || $q.when(response);
                },
                //this is called after each unsuccessful server request
                'responseError': function (response) {
                    //console.log('requestError:' + response);
                    setMessage(response);
                    return $q.reject(response);
                }

            };
        });

        $httpProvider.interceptors.push(function ($rootScope, $q) {

            return {
                'request': function (config) {
                    // console.log('request:' + config);
                    return config || $q.when(config);
                },
                'requestError': function (rejection) {
                    // console.log('requestError:' + rejection);
                    return rejection;
                },
                //success -> don't intercept
                'response': function (response) {
                    // console.log('response:' + response);
                    return  response || $q.when(response);
                },
                //error -> if 401 save the request and broadcast an event
                'responseError': function (response) {
                    console.log('responseError:' + response);
                    if (response.status === 401) {
                        var deferred = $q.defer(),
                                req = {
                                    config: response.config,
                                    deferred: deferred
                                };
                        $rootScope.requests401.push(req);
                        $rootScope.$broadcast('event:loginRequired');
                        return deferred.promise;
                    }
                    return $q.reject(response);
                }

            };
        });


        httpHeaders = $httpProvider.defaults.headers;
    });
    
    as.run(function(editableOptions) {
    	  editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
    });


    as.run(function ($rootScope, $http, $route, $location, base64,$window,log) {
        //make current message accessible to root scope and therefore all scopes
        $rootScope.message = function () {
            return message;
        };

        /**
         * Holds all the requests which failed due to 401 response.
         */
        $rootScope.requests401 = [];

        $rootScope.$on('event:loginRequired', function () {
            //$('#login').modal('show');
        	log.warn("login Required");
            $location.path('/login');
        });

        /**
         * On 'event:loginConfirmed', resend all the 401 requests.
         */
        $rootScope.$on('event:loginConfirmed', function () {
            var i,
                    requests = $rootScope.requests401,
                    retry = function (req) {
                        $http(req.config).then(function (response) {
                            req.deferred.resolve(response);
                        });
                    };

            for (i = 0; i < requests.length; i += 1) {
                retry(requests[i]);
            }
            $rootScope.requests401 = [];


           log.info('login success - Redirect to apicemlogin page');
            //$location.path('/posts');
            $location.path('/apicemlogin');
        });

        /**
         * On 'event:loginRequest' send credentials to the server.
         */
        $rootScope.$on('event:loginRequest', function ($scope,event, username, password) {
            //httpHeaders.common['Authorization'] = 'Basic ' + base64.encode(username + ':' + password);
            //console.log('httpHeaders.common[\'Authorization\']@' + httpHeaders.common['Authorization'] + ':::' + username + ':' + password);
            
            /*$http.get('api/self')
                    .success(function (data) {
                        console.log(data);
                        $rootScope.user = data;
                        $window.sessionStorage['user']=JSON.stringify(data);
                        $rootScope.$broadcast('event:loginConfirmed');
                    })
                    .error(function (data) {
                        log.warn('login failed...');
                        
                    });*/
        	/*$scope.isError=false;
            $scope.errorMsg="";
        	var data = { username: username, password: password };
	        //var httpHeaders=$http.defaults.headers;
        	console.log(data);
	        httpHeaders.common['Authorization'] = 'Basic YWRtaW46dGVzdDEyMw==';
            	
	        $http({
	        	    method: 'POST',
	        	    url: 'api/self/login',
	        	    data: data,
	        	    headers: {'Content-Type': 'application/json'}
	        	}).success(function (data) {
	        		$rootScope.user = data;
                    $window.sessionStorage['user']=JSON.stringify(data);
                    $rootScope.$broadcast('event:loginConfirmed');	        		 
                    $rootScope.isError=false;
                    $rootScope.errorMsg="";     		
	            })
	            .error(function (data, status, headers, config) {
	                log.warn('signup failed...');
	                $rootScope.isError=true;
	                $rootScope.errorMsg="Error: "+data;
	            });*/
        });

        /**
         * On 'logoutRequest' invoke logout on the server and broadcast 'event:loginRequired'.
         */
        $rootScope.$on('event:logoutRequest', function () {
            httpHeaders.common['Authorization'] = null;
        });

        var routesOpenToPublic = [];
        angular.forEach($route.routes, function (route, path) {
            // push route onto routesOpenToPublic if it has a truthy publicAccess value
            route.publicAccess && (routesOpenToPublic.push(path));
        });

        $rootScope.$on('$routeChangeStart', function (event, nextLoc, currentLoc) {
            //console.log('fire event@$routeChangeStart');
        	log.info("Opening page- "+$location.path());
        	
            var closedToPublic = (-1 === routesOpenToPublic.indexOf($location.path()));
            if (closedToPublic && ($window.sessionStorage['user']==null ||  $window.sessionStorage['user'] == "null")) {
                //console.log('login required...');             
                $rootScope.$broadcast('event:loginRequired');
            } else if ($window.sessionStorage['user'] != null && $window.sessionStorage['user'] != "null") {
                //console.log('already logged in...'); 
                //console.log($window.sessionStorage['user']); 
                if (!!nextLoc && nextLoc.templateUrl == 'partials/login.html') {
                    $location.path('/login');
                } else {
                    
                }
            }
        });
    });
}());