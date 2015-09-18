(function() {
	var as = angular.module('apicemApp.controllers', [ 'smart-table', 'ui.utils', 'ui.select', 'xeditable','ngMessages','ui.bootstrap' ]);
	
	var regexIso8601 = /^(\d{4}|\+\d{6})(?:-(\d{2})(?:-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})\.(\d{1,})(Z|([\-+])(\d{2}):(\d{2}))?)?)?)?$/;

	function convertDateStringsToDates(input) {
	    // Ignore things that aren't objects.
	    if (typeof input !== "object") return input;

	    for (var key in input) {
	        if (!input.hasOwnProperty(key)) continue;

	        var value = input[key];
	        var match;
	        // Check for string properties which look like dates.
	        if (typeof value === "string" && (match = value.match(regexIso8601))) {
	            var milliseconds = Date.parse(match[0])
	            if (!isNaN(milliseconds)) {
	                input[key] = new Date(milliseconds);
	            }
	        } else if (typeof value === "object") {
	            // Recurse into object
	            convertDateStringsToDates(value);
	        }
	    }
	}
	
	as.config(["$httpProvider", function ($httpProvider) {
	     $httpProvider.defaults.transformResponse.push(function(responseData){
	        convertDateStringsToDates(responseData);
	        return responseData;
	    });
	}]);
	
	as.controller('MainController', function ($q, $scope, $rootScope, $http, i18n, $location, $window,log) {
		
		if($window.sessionStorage['user'] != undefined || $window.sessionStorage['user'] != null){
			$rootScope.user = JSON.parse($window.sessionStorage['user']);
		}
		var load = function() {
		};

		load();

		$scope.language = function() {
			return i18n.language;
		};
		$scope.setLanguage = function(lang) {
			i18n.setLanguage(lang);
		};
		$scope.activeWhen = function(value) {
			return value ? 'active' : '';
		};

		$scope.path = function() {
			return $location.url();
		};

		// $scope.login = function() {
		// console.log('username:password @' + $scope.username + ',' +
		// $scope.password);
		// $scope.$emit('event:loginRequest', $scope.username, $scope.password);
		// //$('#login').modal('hide');
		// };
		$scope.logout = function() {
			log.info("logout from system");
			$rootScope.user = null;
			$scope.username = $scope.password = null;
			$window.sessionStorage['user'] = null;
			//$scope.$emit('event:logoutRequest');
			$location.url('/login');
		};

	});

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
	
	as.controller('ApicDeleteModalController', function ($scope, $modalInstance) {

		  $scope.ok = function () {
		    $modalInstance.close();
		  };

		  $scope.cancel = function () {
		    $modalInstance.dismiss('cancel');
		  };
	});
	as.controller('ApicEMLoginController', function($scope, $rootScope, $http, base64, $location, DeviceData, $window,$modal,log) {

		$scope.selectedApicem = '';
		$scope.apicUsername = '';
		$scope.apicPassword = '';
		$scope.version = '';
		$scope.apicemType = '';
		$scope.allApicEms = [];
		$scope.isError=false;
		$scope.isError2=false;
		
		$scope.temp= {
					connect : "connectToApicTemp.html",
					onboard : "onboardApicTemp.html",
					preOnboard: "preOnboardApicTemp.html"
		}
		
		$scope.onBoardTypelist = [
		                          { name:'APIC-EM IP',  type : 'IP',id :1},
		                          { name:'APIC-EM DNS', type : 'DNS',id:2 } 
		                         ];
		//$scope.onboardType= { name:'APIC-EM IP' ,type : 'IP',id :1};
		
		$scope.versions = [ {
			value : 'v0',
			text : 'V0'
		}, {
			value : 'v1',
			text : 'V1'
		} ];

		load = function() {
			log.info("Loading apicem");
			$scope.allApicEms = [];
			$http.get('api/apicem').success(function(data) {
				angular.forEach(data, function(apicEm) {
					//console.log(apicEm);
					$scope.allApicEms.push(apicEm);
					$scope.selectedApicem = apicEm.apicemIP;
				});

			});
		}

		load();

		$scope.apicemLogin = function() {
			log.info("apicemLogin function call");
			DeviceData.setSelectedApicEm($scope.selectedApicem);
			$scope.version = '';
			angular.forEach($scope.allApicEms, function(apicEm) {
				if (apicEm.apicemIP == $scope.selectedApicem) {
					DeviceData.setApicemVersion(apicEm.version);
					$scope.version = apicEm.version;
				}
			});

			var actionURL = "api/token";
			var data = {
				"username" : $scope.apicUsername,
				"password" : $scope.apicPassword,
				"apicemIP" : $scope.selectedApicem,
				"version" : $scope.version,
				"apicemType" : $scope.apicemType,
			};

			$http.post(actionURL, data).success(function(data) {
				$scope.isError=false;
				$scope.errorMsg="";
			
				log.info("apicemLogin Success for " +$scope.selectedApicem);
				DeviceData.setToken(data);
				$window.sessionStorage.setItem('token', data);
				$window.sessionStorage.setItem('username', $scope.apicUsername);
				$window.sessionStorage.setItem('password', $scope.apicPassword);
				$window.sessionStorage.setItem('version', $scope.version);
				$window.sessionStorage.setItem('apicem', $scope.selectedApicem);
				$http.defaults.headers.common['X-Access-Token'] = data;
				$http.defaults.headers.common['apicem'] = $scope.selectedApicem;
				$http.defaults.headers.common['version'] = $scope.version;
				$location.url("/devices");
			}).error(function(data) {
				$scope.isError=true;
				$scope.errorMsg="Server unavailable.. Please check your IP address and try again.";
				log.warn("apicemLogin Failure - " + data);
			});
		};

		$scope.onboardApicEm = function() {
			log.info("onboardApicEm function call");
			validateIp = function(ip) {
					var data = {
						"apicemIP" : $scope.newApicIP,
						"version" : $scope.newApicVersion,
						"location" : $scope.location,
						"apicemType" : $scope.onboardType.type
					};
					var actionURL = "api/apicem";
					$http.post(actionURL, data).success(function(data) {
						$scope.isError2=false;
						$scope.errorMsg2="";
						log.info("Success Data is " + data);
						$scope.newApicIP = "";
						$scope.newApicVersion = "";
						$scope.location = "";
						load();
					}).error(function(data, status, headers, config){
						log.error("onboardApicEm failed - " + data);
						$scope.isError2=true;
						$scope.errorMsg2="Please fix "+data;
						
					});
			}
			validateIp($scope.newApicIP);
		}

		$scope.changeIp = function() {
			log.info('Validating IP Address');

			ValidateIPAddress = function(ip) {
				var actionURL = "api/apicem/validate";
				var data = {
					"apicemIP" : $scope.newApicIP,
					"apicemType" : $scope.onboardType.type,
				};
				$http.post(actionURL, data).success(function(data) {
					log.info("IP Address Validation Success - " + data);
					$scope.isError2=false;
					$scope.errorMsg2="";
				}).error(function(data, status, headers, config){
					log.error("IP Address Validation failed - " + data);
					$scope.isError2=true;
					$scope.errorMsg2=data;
					
				});
			}
			if ($scope.newApicIP != null && $scope.newApicIP != 'undefined') {
				ValidateIPAddress($scope.newApicIP);
			}
		}

		$scope.isValidIP = function(ip) {
			log.info('Validating IP Address');

			if (ip != null && ip != 'undefined') {
				var actionURL = "api/apicem/validate";
				var data = {
					"apicemIP" : ip,
				};
				$http.post(actionURL, data).success(function(data) {
					log.info("IP Address Validation Success - " + data);
				});
			}
		}

		$scope.saveApicEMIP = function(updateApicemIP,id) {
			log.info('saveApicEMIP Function Call');
			//console.log('updateapicemIP');
			console.log(updateApicemIP);
			$scope.isError3=false;
			$scope.errorMsg3="";
			$scope.isSuccess3=false;
			$scope.successMsg3="";
			var data = {
				"apicemIP" : updateApicemIP.apicemIP,
				"version" : updateApicemIP.version,
				"id" : id,
				"location" : updateApicemIP.location,
				"apicemType" : updateApicemIP.apicemType
			};
			var actionURL = "api/apicem/"+id;
			$http.put(actionURL, data).success(function(data) {
				log.info("saveApicEMIP Success - " + data);
				$scope.isError3=false;
				$scope.errorMsg3="";
				$scope.isSuccess3=true;
				$scope.successMsg3=updateApicemIP.apicemIP + " updated!!";
				load();
			}).error(function(data) {
				log.error("saveApicEMIP failed - " + data);
				$scope.isError3=true;
				$scope.errorMsg3="Update failed - " + data;
				$scope.isSuccess3=false;
				$scope.successMsg3="";
				load();
			});
		}

		$scope.deleteApicemIP = function(deleteIP,index) {
			log.info('deleteApicemIP Function Call');
			
			$scope.animationsEnabled = true;
		    var modalInstance = $modal.open({
		      animation: $scope.animationsEnabled,
		      templateUrl: 'myModalContent.html',
		      controller: 'ApicDeleteModalController',
		      size: 'sm'
		    });

		    modalInstance.result.then(function () {
		    	var actionURL = "api/apicem/"+deleteIP;
				$http.delete(actionURL).success(function(data) {
					log.info("deleteApicemIP delete success - " + deleteIP);
					load();
				});
		    }, function () {
		       log.info("cancel");
		    });
			  			
		}

		$scope.order = '+location';

		$scope.orderBy = function(property) {
			$scope.order = ($scope.order[0] === '+' ? '-' : '+') + property;
		};

		$scope.orderIcon = function(property) {
			return property === $scope.order.substring(1) ? $scope.order[0] === '+' ? 'glyphicon glyphicon-chevron-up' : 'glyphicon glyphicon-chevron-down' : '';
		};

		/*
		 * $scope.setSelectedApicEm = function(apicem){
		 * angular.element('#apicemIp').focus();
		 * //angular.element('#apicemIp').val(apicem); $scope.selectedApicem =
		 * apicem;
		 *  }
		 */

	});

	as.controller('SearchController', function($scope, $rootScope, $http, i18n, $location, DeviceData, $window, $filter,log) {
		$scope.currentDate = Date.now();
		DeviceData.setCurrentDate($scope.currentDate);
		$scope.originalData = '';
		$scope.deviceCategory = 'all';
		$scope.itemsPerPage = "10";
		$scope.groupBy = 'groupBy_deviceType';
		var groupType = $scope.groupBy;

		$http.defaults.headers.common['X-Access-Token'] = $window.sessionStorage.getItem('token');
		$http.defaults.headers.common['apicem'] = $window.sessionStorage.getItem('apicem');
		$http.defaults.headers.common['version'] = $window.sessionStorage.getItem('version');
		var actionUrl = 'api/discovery/search';
		load = function() {	
			$http.get(actionUrl).success(function(data) {
				log.info("Loading Devices Inventory Details success");
				//console.log("Data is " + JSON.stringify(data[0]));
				$scope.originalData = data;
				DeviceData.setDeviceData(data);
				$window.sessionStorage['devices'] = JSON.stringify(data);
				$scope.devices = groupByData(data, groupType);
				// }
			});
		}
		load();

		groupByData = function(data, groupBy) {
			var groupByUrl = 'api/discovery/' + groupBy + '/groupby';
			$http.post(groupByUrl, data).success(function(response) {
				//console.log("Group By Data is " + JSON.stringify(response));
				$scope.devices = response;
			});
		}

		$scope.groupByChange = function() {
			$scope.devices = groupByData(DeviceData.getDeviceData(), groupType);
			$scope.deviceCategory = 'all';
		}

		$scope.deviceCategroryChange = function() {
			if ($scope.deviceCategory == 'all') {
				$scope.devices = groupByData(DeviceData.getDeviceData(), groupType);
			} else {
				$scope.filterDevices = [];
				angular.forEach(DeviceData.getDeviceData(), function(device) {

					if ($scope.deviceCategory == 'Cisco') {
						if (device.vendor == $scope.deviceCategory) {
							$scope.filterDevices.push(device);
						}
					} else {
						if (device.type == $scope.deviceCategory) {
							$scope.filterDevices.push(device);
						}
					}
				});

				$scope.devices = groupByData($scope.filterDevices, groupType);
			}
		}

		$scope.order = '+platformId';

		$scope.orderBy = function(property) {
			$scope.order = ($scope.order[0] === '+' ? '-' : '+') + property;
		};

		$scope.orderIcon = function(property) {
			return property === $scope.order.substring(1) ? $scope.order[0] === '+' ? 'glyphicon glyphicon-chevron-up' : 'glyphicon glyphicon-chevron-down' : '';
		};
		
		$scope.exportToExcel = function() {
		    $http({method: 'POST', url: "api/discovery/export",
		        responseType: "arraybuffer",data :DeviceData.getDeviceData()}).     
		        success(function(data, status, headers, config) {  
		        	saveAs(new Blob([data],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}), "Network_Assessment_App.xlsx");
					log.info("Excel File generated successfully");
		        	console.log("File generated successfully....");
		        });
		}
		
		$scope.manageExcel = function() {
			log.info("Manage Excel clicked from Device Inventory Detail page");
			$location.url('/manageexcel');
		}
		
		$scope.saveToExcel = function() {
			var UserId=0;
			if($window.sessionStorage['user'] != null)
			{
				$rootScope.user =JSON.parse($window.sessionStorage['user']);
				if($rootScope.user != null){
					UserId= parseInt($rootScope.user.id);
				}
			}
			
			var id=Math.random() * 8000;
			
			var data = {
					"userId" : UserId,
					"filename" : "Network_Assessment_App_"+parseInt(id)+".xlsx",
					"id" : id,
					"fileData" : DeviceData.getDeviceData()
				};
			$http({method: 'POST', url: "api/discovery/saveExcel",data :data}).     
		        success(function(data, status, headers, config) {  
		        	log.info("Excel File Save successfully");
					$location.url('/manageexcel');
		        });
		}

		$scope.exportToExcel1 = function() {
			var date = $filter('date')(new Date(), 'shortDate');
			var fileName = "NetworkDevices_" + date + ".xlsx";

			// JSONToCSVConvertor(JSON.parse($window.sessionStorage["devices"]),
			// 'NetworkDevices_'+ date, false);
			/*
			 * var blob = new
			 * Blob([document.getElementById('deviceTable').innerHTML], { type:
			 * "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
			 * }); saveAs(blob, fileName);
			 */
			$scope.printItems = [];
			angular.forEach(DeviceData.getDeviceData(), function(device) {
				var data = {
					"Platform ID" : device.platformId,
					"Device Type" : device.type,
					"Software Version" : device.softwareVersion,
					"Location" : device.locationName,
					"Tags" : device.tags,
					"Family" : device.family,
					"Vendor" : device.vendor,
					"Host Name" : device.hostname,
					"Serial Number" : device.serialNumber,
					"IP Address" : device.managementIpAddress,
					"MAC Address" : device.macAddress,
					"Reachability Status" : device.reachabilityStatus,
					"Reachability Reason" : device.reachabilityFailureReason
				};
				$scope.printItems.push(data);
			});

			var mystyle = {
				sheetid : 'Network Assessment Application',
				headers : true,
				  caption: {
			          title:'Network Assessment Application',
			          style:'font-size: 100px; color:darkgray;' // Sorry, styles
																// do not works
			        },
			        style:'background:white',
			        column: {
			          style:'font-size:30px'
			        },
			        columns: [
			          {columnid:'Platform ID',width:300},
			          {columnid:'Device Type',width:300},
			          {columnid:'Software Version',width:300},
			          {columnid:'Location',width:300},
			          {columnid:'Tags',width:300},
			          {columnid:'Family',width:300},
			          {columnid:'Vendor',width:300},
			          {columnid:'Host Name',width:300},
			          {columnid:'Serial Number',width:300},
			          {columnid:'IP Address',width:300},
			          {columnid:'MAC Address',width:300},
			          {columnid:'Reachability Status',width:300},
			          {columnid:'Reachability Reason',width:1000}
			        ],
			      	row : {
					style : function(sheet, row, rowidx) {
						return 'background:' + (rowidx % 2 ? 'white' : 'darkgray');
					}
				},
				 rows: {1:{style:{Font:{Color:"#FF0077"}}}}
			    };
			
			
			var query = 'SELECT * INTO XLSX("' + fileName + '",?) FROM ?';
			alasql(query, [ mystyle, $scope.printItems ]);

		};

	});
	
	as.controller('ApicExcelController', function($scope, $rootScope, $http, i18n, $location, DeviceData, $window, $filter,log) {
		$scope.currentDate = Date.now();
		DeviceData.setCurrentDate($scope.currentDate);
		$scope.originalData = '';
		$scope.itemsPerPage = "10";
		var groupType = $scope.groupBy;
		
		var UserId=0;
		if($window.sessionStorage['user'] != null)
		{
			$rootScope.user =JSON.parse($window.sessionStorage['user']);
			if($rootScope.user != null){
				UserId= parseInt($rootScope.user.id);
			}
		}

		$http.defaults.headers.common['X-Access-Token'] = $window.sessionStorage.getItem('token');
		$http.defaults.headers.common['apicem'] = $window.sessionStorage.getItem('apicem');
		$http.defaults.headers.common['version'] = $window.sessionStorage.getItem('version');
		var actionUrl = 'api/discovery/getExcelFileList';
		load = function() {
			var httpHeaders=$http.defaults.headers;
			httpHeaders.common['Authorization'] = 'Basic YWRtaW46dGVzdDEyMw==';
			
			$http.get(actionUrl,{ params: {id: UserId}}).success(function(data) {
				log.info("Loading Excel files for user");
				//console.log("Data is " + JSON.stringify(data));
				$scope.originalFileData = data;
				DeviceData.setDeviceData(data);
				$window.sessionStorage['excelFiles'] = JSON.stringify(data);
				$scope.files = data;
				// }
			});
		}
		load();	
		
		$scope.exportToExcel = function(id, filename) {
		    $http({method: 'POST', url: "api/discovery/exportFile",
		        responseType: "arraybuffer",data : parseInt(id) }).     
		        success(function(data, status, headers, config) {  
		        	saveAs(new Blob([data],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}), filename);
					log.info("Excel File generated successfully");
		        	console.log("File generated successfully....");
		        });
		}

		$scope.order = '+createdDate';

		$scope.orderBy = function(property) {
			$scope.order = ($scope.order[0] === '+' ? '-' : '+') + property;
		};

		$scope.orderIcon = function(property) {
			return property === $scope.order.substring(1) ? $scope.order[0] === '+' ? 'glyphicon glyphicon-chevron-up' : 'glyphicon glyphicon-chevron-down' : '';
		};

	});

	as.controller('ReplaceCtrl', function($scope, $http, $routeParams, i18n, $location, DeviceData, $filter, $window) {

		$scope.path = '/' + $routeParams.platformId;

		$scope.itemsPerPage = "10";
		$scope.platformId = decodeURIComponent($routeParams.platformId);
		$window.sessionStorage.setItem('selectedItem', $scope.platformId);
		$scope.allDevices = JSON.parse($window.sessionStorage["devices"]);
		$scope.type = '';
		DeviceData.setPlatformId($routeParams.platformId);
		$scope.deviceType = $routeParams.type;
		$window.sessionStorage.setItem('deviceType', $scope.deviceType);
		load = function() {
			var replaceItemData = [];
			angular.forEach($scope.allDevices, function(device) {
				if (device.platformId == $scope.platformId) {
					var pushDevice ={
							"type":device.type,
							"platformId":device.platformId,
							"qty":device.qty,
							"tags":device.tags,
							"family":device.family,
							"locationName":device.locationName
					};
					replaceItemData.push(pushDevice);
				}
			}, replaceItemData);
			$scope.devices = replaceItemData;
		}

		load();

		$scope.platformIdChange = function() {
			load();
			$scope.selectedAll = false;
			angular.forEach($scope.devices, function(item) {
				item.selected = false;
			});
		}

		$scope.checkAll = function() {
			if ($scope.selectedAll) {
				$scope.selectedAll = true;
			} else {
				$scope.selectedAll = false;
			}
			angular.forEach($scope.devices, function(item) {
				item.selected = $scope.selectedAll;
			});
		};

		$scope.checkDevice = function(device) {
			if (device.selected == false) {
				$scope.selectedAll = false;
			}
		}

		$scope.replaceDevices = function() {
			$scope.selectedCount = 0;
			angular.forEach($scope.devices, function(item) {
				if (item.selected == true) {
					$scope.selectedCount = $scope.selectedCount + 1;
				}
			});
			if ($scope.selectedCount == 0) {
				alert("Please select atleast one device to replace");
			} else {
				$location.url('/products/' + $scope.selectedCount + '/' + $scope.deviceType + '/' + encodeURIComponent($scope.platformId));
			}
		}

		$scope.order = '+platformId';

		$scope.orderBy = function(property) {
			$scope.order = ($scope.order[0] === '+' ? '-' : '+') + property;
		};

		$scope.orderIcon = function(property) {
			return property === $scope.order.substring(1) ? $scope.order[0] === '+' ? 'glyphicon glyphicon-chevron-up' : 'glyphicon glyphicon-chevron-down' : '';
		};

	});

	as.controller('QuestionCtrl', function($scope, $http, $routeParams, i18n, $location, DeviceData, $filter, $window) {
		$scope.itemsPerPage = "10";
		$scope.platformId = decodeURIComponent($routeParams.platformId);
		$scope.selectedItem = decodeURIComponent($window.sessionStorage.getItem('selectedItem'));
		$scope.dType = $window.sessionStorage.getItem('deviceType');
		$scope.qty = $routeParams.count;
		$window.sessionStorage.setItem('qty', $scope.qty);
		$scope.currDate = DeviceData.getCurrentDate();
		$scope.deviceType = $routeParams.type;
		load = function() {
			$scope.productCatalog = [];
			$scope.replacableProducts = [];
			$scope.allProducts = [];
			$http.get('product-catalog.json').success(function(data) {
				$scope.productCatalog = data.products;
				angular.forEach(data.products, function(prodCatalog) {
					if (prodCatalog.type == $scope.deviceType) {
						$scope.replacableProducts.push(prodCatalog);
						$scope.allProducts.push(prodCatalog);
					}
				});
			});
			console.log("Products::" + $scope.replacableProducts);
		}

		$scope.allTags = [];
		questions = function() {
			$scope.questions = [];
			$http.get('questions.json').success(function(data) {
				angular.forEach(data.questions, function(question) {
					if (question.deviceType == $scope.deviceType) {
						$scope.questions.push(question);
						$scope.allTags.push(question.name);
					}
				});
			});
		}

		$scope.questionSelected = function(id) {
			$scope.tags = [];
			angular.forEach($scope.questions, function(question) {
				if (question.checked) {
					var text = {
						"text" : question.name
					};
					$scope.tags.push(text);
				} else {
					question.selectedOtion = "";
				}
			});

			filterTheProducts();
		}

		$scope.tagRemoved = function(tag) {
			angular.forEach($scope.questions, function(question) {
				if (question.name == tag.text) {
					question.checked = false;
					question.selectedOtion = "";
				}
			});

			filterTheProducts();
		}

		// Clear all questions
		$scope.clearQuestions = function() {
			angular.forEach($scope.questions, function(question) {
				question.checked = false;
				question.selectedOtion = "";
			});

			$scope.tags = [];

			$scope.replacableProducts = [];
			angular.forEach($scope.allProducts, function(product) {
				$scope.replacableProducts.push(product);
			});
		}

		questionSelected = function() {
			var selected = false;
			angular.forEach($scope.questions, function(question) {
				if (question.checked) {
					selected = true;
				}
			});
			return selected;
		}

		contains = function(array, str) {
			var hasValue = false;
			angular.forEach(array, function(item) {
				if (item == str) {
					hasValue = true;
				}
			});
			return hasValue;
		}

		// Filter the products based on the current question set
		filterTheProducts = function() {
			$scope.replacableProducts = [];
			var selected = questionSelected();
			angular.forEach($scope.allProducts, function(product) {
				$scope.pushProduct = 0;
				if (selected) {
					angular.forEach($scope.questions, function(question) {
						if (question.checked && $scope.pushProduct >= 0) {
							if (product[question.id].toLowerCase() == "Y".toLowerCase() && (question.selectedOtion == "" || contains(product.addlParams, question.selectedOtion))) {
								$scope.pushProduct = 1;
							} else {
								$scope.pushProduct = -1;
							}
						}
					});
				}
				if ($scope.pushProduct == 1 || !selected) {
					$scope.replacableProducts.push(product);
				}
			});
		}

		// Navigate to BOM page after clicking the product
		$scope.selectedProduct = function(product) {
			$scope.billProducts = [];
			$scope.billProducts.push(product);
			DeviceData.setBillProducts($scope.billProducts);
			$location.url('/product/' + $scope.qty + '/bom/' + encodeURIComponent(product.productId));
		}

		load();
		questions();
		filterTheProducts();

		$scope.loadQuestions = function($query) {
			return $http.get('questions.json', {
				cache : true
			}).then(function(response) {
				var questions = response.data.questions;
				return questions.filter(function(question) {
					return question.name.toLowerCase().indexOf($query.toLowerCase()) != -1;
				});
			});
		};

	});

	as.controller('BomCtrl', function($scope, $http, $routeParams, i18n, $location, DeviceData, $filter, $window) {
		$scope.productId = decodeURIComponent($routeParams.productId);
		$scope.qty = $routeParams.qty;
		$scope.platformId = $window.sessionStorage.getItem('selectedItem');
		$scope.dType = $window.sessionStorage.getItem('deviceType');
		$scope.count = $window.sessionStorage.getItem('qty');
		$scope.products = [];
		$http.get('product-catalog.json').success(function(data) {
			$scope.productCatalog = data.products;
			angular.forEach($scope.productCatalog, function(prodCatalog) {
				if (prodCatalog.productId == $scope.productId) {
					prodCatalog.qty = $scope.qty;
					$scope.products.push(prodCatalog);
				}
			});
		});

		$scope.placeOrder = function() {
			$scope.generateBOM();
			$window.open('https://www.cisco.com/go/commerceworkspace', '_blank');
		}

		$scope.save = function() {
			$scope.generateBOM();
		}

		$scope.sendForApproval = function() {
			$scope.generateBOM();
			$window.open('https://www.cisco.com/go/commerceworkspace', '_blank');
		}

		$scope.generateBOM = function() {
			$scope.data = [];
			angular.forEach($scope.products, function(product) {
				$scope.data = [ {
					"Product" : product.productId,
					"Description" : product.description,
					"Qty" : product.qty,
					"Unit Price" : product.price,
					"Total Price" : product.price * product.qty
				} ];
			});

			var date = $filter('date')(new Date(), 'shortDate');
			var fileName = "BOM_" + date + ".xlsx";

			var mystyle = {
				sheetid : 'Bill Of Material',
				headers : true,
				caption : {
					title : 'Bill Of Material',
					style : 'font-size: 50px; color:blue;' // Sorry, styles do
															// not works
				},
				style : 'background:#00FF00',
				column : {
					style : 'font-size:30px'
				},
				row : {
					style : function(sheet, row, rowidx) {
						return 'background:' + (rowidx % 2 ? 'red' : 'yellow');
					}
				},
				rows : {
					1 : {
						cell : {
							style : 'background:blue'
						}
					}
				}
			};
			var query = 'SELECT * INTO XLSX("' + fileName + '",?) FROM ?';
			alasql(query, [ mystyle, $scope.data ]);

		}

	});

}());