
var as = angular.module('apicemApp.users', [ 'smart-table', 'ui.utils', 'ui.select', 'xeditable','ngMessages','ui.bootstrap','ui.select2' ]);

as.controller('LoginController', function ($scope, $rootScope, $http, base64, $location, $window, userService,log) {

    $scope.login = function () {
    	log.info("Login button clicked");
    	
    	$scope.isError=false;
        $scope.errorMsg="";
    	var data = { username: $scope.username, password: $scope.password };
        var httpHeaders=$http.defaults.headers;
        httpHeaders.common['Authorization'] = 'Basic YWRtaW46dGVzdDEyMw==';
        	
        $http({
        	    method: 'POST',
        	    url: 'api/self/login',
        	    data: data,
        	    headers: {'Content-Type': 'application/json'}
        	}).success(function (data) {
        		var data1=JSON.parse(data);
        		$rootScope.user = data1;
                $window.sessionStorage['user']=JSON.stringify(data1);
                $rootScope.$broadcast('event:loginConfirmed');	        		 
                $scope.isError=false;
                $scope.errorMsg="";     		
            })
            .error(function (data, status, headers, config) {
                log.warn('login failed - '+data);
                $scope.isError=true;
                $scope.errorMsg=data;
            });
	};

	$scope.register = function () {
		log.info("Register button clicked from Login page");
		$location.url('/signup');
	};
});

as.controller('ForgotController', function ($scope, $rootScope, $http, base64, $location, $window,log) {

	$scope.isError=false;
	$scope.isSuccess=false;
	$scope.errorMsg="";
	$scope.successMsg="";
	
    $scope.forgot = function () {
        
        log.info("Forgot password button clicked");
        
        $scope.$broadcast('show-errors-check-validity');
        if ($scope.forgotFm.$invalid) { return; }
        
        var data = { email: $scope.email };
        var httpHeaders=$http.defaults.headers;
        httpHeaders.common['Authorization'] = 'Basic YWRtaW46dGVzdDEyMw==';
        	
        $http({
        	    method: 'POST',
        	    url: 'api/self/forgetPassword',
        	    data: data,
        	    headers: {'Content-Type': 'application/json'}
        	}).success(function (data) {
        		$scope.isError=false;
        		$scope.isSuccess=true;
        		$scope.errorMsg="";
        		$scope.email="";
        		$scope.successMsg="email sent with password successfully!!";    		
            })
            .error(function (data, status, headers, config) {
                log.warn('Forgot password failed - '+data);
                $scope.isError=true;
        		$scope.isSuccess=false;
        		$scope.errorMsg=data;
        		$scope.successMsg="";
            });
        console.log('username:' + $scope.username );
    };

	$scope.login = function () {
		log.info("Back to Login clicked from Forgot password page");
		$location.url('/login');
	};
});

as.controller('SignUpController', function ($scope, $rootScope, $http, base64, $location, $window, userService,log) {
	$scope.isError=false;
	$scope.isSuccess=false;
	$scope.errorMsg="";
	$scope.successMsg="";
	
    $scope.signUp = function () {
    	
    	log.info("Sign Up button clicked");
    	
        $scope.$broadcast('show-errors-check-validity');
        if ($scope.userForm.$invalid) { 
        	$scope.isError=true;
    		$scope.isSuccess=false;
    		$scope.errorMsg="Fill required fields in red";
        	return; 
        }
        else if ($scope.password != $scope.confirm_password) { 
        	$scope.isError=true;
    		$scope.isSuccess=false;
    		$scope.errorMsg="password and confirm password are not matching";
        	return; 
        }
        else
        {
	        var data = { username: $scope.username, id: Math.random() * 2000, password: $scope.password, email: $scope.email, role: "user" };
	        var httpHeaders=$http.defaults.headers;
	        httpHeaders.common['Authorization'] = 'Basic YWRtaW46dGVzdDEyMw==';
            	
	        $http({
	        	    method: 'POST',
	        	    url: 'api/self/signup',
	        	    data: data,
	        	    headers: {'Content-Type': 'application/json'}
	        	}).success(function (data) {
	                console.log(data);
	                $scope.isError=false;
	        		$scope.isSuccess=true;
	        		$scope.errorMsg="";
	        		$scope.successMsg="Signup completed successfully!!";
	        		$scope.username="";
	        		$scope.password="";
	        		$scope.confirm_password="";
	        		$scope.email="";		        		
	            })
	            .error(function (data, status, headers, config) {
	                log.warn('Sign Up failed - '+data);
	                $scope.isError=true;
	        		$scope.isSuccess=false;
	        		$scope.errorMsg=data;
	        		$scope.successMsg="";
	            });
        	}	      
    };

	$scope.login = function () {
		log.info("Back to Login clicked from Register page");
		$location.url('/login');
	};
});

as.controller('UserDetailController', function ($scope, $rootScope, $http, base64, $location, $window, userService,log) {

	$scope.isError=false;
	$scope.isSuccess=false;
	$scope.errorMsg="";
	$scope.successMsg="";
	
	var UserId=0;
	if($window.sessionStorage['user'] != null)
	{
		$rootScope.user =JSON.parse($window.sessionStorage['user']);
		if($rootScope.user != null){
			UserId= parseInt($rootScope.user.id);
		}
	}
	
	$scope.getUser=function() {
    	
    	log.info("Fetching User Details");	        
    	
        var httpHeaders=$http.defaults.headers;
        httpHeaders.common['Authorization'] = 'Basic YWRtaW46dGVzdDEyMw==';
        
		$http.get('api/self/getUser',{ params: {id: UserId}}).success(function(data) {
			$scope.model = JSON.parse(data);
		});			
	}
	
	$scope.getUser();
	
    $scope.changeDetails = function () {
    	
    	log.info("Update button clicked from User Detail Page");
    	
        $scope.$broadcast('show-errors-check-validity');
        if ($scope.userForm.$invalid) { 
        	$scope.isError=true;
    		$scope.isSuccess=false;
    		$scope.errorMsg="Fill required fields in red";
        	return; 
        }
        else if ($scope.password != $scope.confirm_password) { 
        	$scope.isError=true;
    		$scope.isSuccess=false;
    		$scope.errorMsg="password and confirm password are not matching";
        	return; 
        }
        else
        {
	        var data = { username: $scope.model.username, id: UserId, password: $scope.model.password, email: $scope.model.email, role: $scope.model.role };
	        var httpHeaders=$http.defaults.headers;
	        httpHeaders.common['Authorization'] = 'Basic YWRtaW46dGVzdDEyMw==';
            	
	        $http({
	        	    method: 'POST',
	        	    url: 'api/self/updateuser',
	        	    data: data,
	        	    headers: {'Content-Type': 'application/json'}
	        	}).success(function (data) {
	                console.log(data);
	                $scope.isError=false;
	        		$scope.isSuccess=true;
	        		$scope.errorMsg="";
	        		$scope.successMsg="Update completed successfully!!";		    	    	
	    	    	log.info("Update completed successfully!");	        		
	            })
	            .error(function (data, status, headers, config) {
	                log.warn('Update failed - '+data);
	                $scope.isError=true;
	        		$scope.isSuccess=false;
	        		$scope.errorMsg=data;
	        		$scope.successMsg="";
	            });
         }	      
    };
});

as.controller('UsersController', function ($scope, $rootScope, $http, base64, $location, $window, userService,log) {

    $scope.users = userService.getUsers();

    $scope.itemsPerPage = 1;
    log.info("User List page");
});