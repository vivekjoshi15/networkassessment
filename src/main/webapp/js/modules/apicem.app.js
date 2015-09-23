(function() {
	var as = angular.module('apicemApp.controllers', [ 'smart-table', 'ui.utils', 'ui.select', 'xeditable','ngMessages','ui.bootstrap','ui.select2' ]);
	
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

		console.log('*_*_*_');
		$scope.temp= {
					connect : "connectToApicTemp.html",
					onboard : "onboardApicTemp.html",
					preOnboard: "preOnboardApicTemp.html"
		}
		
		$scope.onBoardTypelist = [
		                          { name:'APIC-EM IP',  type : 'IP',id :1},
		                          { name:'APIC-EM DNS', type : 'DNS',id:2 } 
		                         ];
		$scope.onboardType= { name:'APIC-EM IP' ,type : 'IP',id :1};
		
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
	
	as.directive("userName", ['$http', function(http) {
		  return {
		    template: "{{userName}}",
		    scope: {
		      userId: "="
		    },
		    link: function(scope) {
		    	//scope.userName;
			    var httpHeaders=http.defaults.headers;
				httpHeaders.common['Authorization'] = 'Basic YWRtaW46dGVzdDEyMw==';
					
				var actionUrl = 'api/self/getUser';
				http.get(actionUrl,{ params: {id: scope.userId}}).success(function(data) {
					var user = JSON.parse(data);
					scope.userName=user.username;
				});	
		    }
		  }
		}]);
	
	as.filter('userNameFilter', function($http){
		return function(UserId){
		    var userName;
		    var httpHeaders=$http.defaults.headers;
			httpHeaders.common['Authorization'] = 'Basic YWRtaW46dGVzdDEyMw==';
				
			var actionUrl = 'api/self/getUser';
			console.log(UserId);
			$http.get(actionUrl,{ params: {id: parseInt(UserId)}}).success(function(data) {
				var user = JSON.parse(data);
				console.log(user.username);
				userName=user.username;
			    return userName;
			});	
		};
		});

	as.controller('ApicExcelController', function($scope, $rootScope, $http, i18n, $location, DeviceData, $window, $filter,log) {
		$scope.currentDate = Date.now();
		DeviceData.setCurrentDate($scope.currentDate);
		$scope.originalData = '';
		$scope.itemsPerPage = "10";
		$scope.itemPerPages = [
		                       {'text':5, val:5},
		                       {'text':10, val:10},
		                       {'text':20, val:20},
		                       {'text':30, val:30},
		                       {'text':50, val:50}
		                      ]
		var groupType = $scope.groupBy;
		
		var UserId=0;
		$scope.role;
		if($window.sessionStorage['user'] != null)
		{
			$rootScope.user =JSON.parse($window.sessionStorage['user']);
			if($rootScope.user != null){
				UserId= parseInt($rootScope.user.id);
			}
			$scope.role=$rootScope.user.role;
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
				
				$scope.originalFileData = data;
				DeviceData.setDeviceData(data);
				$window.sessionStorage['excelFiles'] = JSON.stringify(data);
				$scope.files = data;
				$scope.itemPerPages.push({'text':'All', val:data.length});
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
	
as.directive('selectTabs', function ($document, $compile) {

	    return {
	        restrict: 'A',
	        scope: {
	            items: '=',
	            selected: '=',
	            itemplaceholder: '@',
	            itemval: '@',
	            itemdisp: '@',
	            recordChanged: '&',
	            isactive: '=',
	            activeclass: '=',
	            acticemessage:'=',
	            onselectedchange:'&'
	        },
	        link: function (scope, elem, attr, ctrl) {
	            scope.hasObj = true;
	            var template = '';
	            scope.isSimpleArray = false;//(scope.items instanceof Array && !(scope.items[0] instanceof Object));
	            if (attr['selectedobj'] == undefined) {
	                scope.hasObj = false;
	            }
	           
	            var tNoMatchText = attr["nomatchtext"] ? attr["nomatchtext"] : "Item not found";
	            var search_filter = attr["searchfilter"] ? attr["searchfilter"] : '$';
	            scope.filterStatus = attr["searchfilter"] ? true : false;
	            var searchplaceholder = attr.searchplaceholder  ? attr["searchplaceholder"] : attr["itemplaceholder"] ? scope.itemplaceholder.replace(/Select/gi, "Search") : "Search Item"  ;

	            if (scope.isSimpleArray) {
	                template = '<input type="text"  class="form-control"  value="{{items[idx]}}"  ng-click="togglePopup()" placeholder="{{itemplaceholder}}" readonly>' +
	                	'<span class="drop-down-icon icons-sets" ng-class="{up:isPopupVisible }" ng-click="togglePopup()"></span>'+
	                	'<ul ng-show="isPopupVisible">' +
	                    '<li ng-repeat="item in filtered = (items | filter:search)" ng-click="setTab(item)">{{item}}</li>' +
	                    '<li ng-show="filtered.length == 0">' + tNoMatchText + '</li>' +
	                    '</ul>';
	            } else {
	                if (scope.hasObj)
	                {
	                    template = '<input type="text" class="form-control" ng-class="{activeclass: isactive2,up:isPopupVisible }" value="{{selected.' + (attr.itemdisp == undefined ? attr.itemval : attr.itemdisp) + '}}"  ng-click="togglePopup()" placeholder="{{itemplaceholder}}" readonly>' +
	                    '<span class="drop-down-icon icons-sets" ng-class="{up:isPopupVisible }" ng-click="togglePopup()"></span>'+
	                    '<ul ng-show="isPopupVisible">' +
	                    '<li class="search-filter" ng-click="searchfn" ng-show="filterStatus"> <input type="text" class="search-icon" ng-model="search.' + search_filter + '"></li>' +
	                    '<li ng-repeat="item in filtered = (items | filter:search)" ng-click="setTab(item)">{{item.' + (attr.itemdisp == undefined ? attr.itemval : attr.itemdisp) + '}} </li>' +
	                    '<li ng-show="filtered.length == 0">' + tNoMatchText + '</li>' +
	                    '</ul>';
	                 }
	                else{
	                    template = '<input type="text"  class="form-control" ng-class="{ invalidRequired : isactive2,up:isPopupVisible }" value="{{items[idx].' + (attr.itemdisp == undefined ? attr.itemval : attr.itemdisp) + '}}"  ng-click="togglePopup()" placeholder="{{itemplaceholder}}" readonly>' +
	                            '<span class="drop-down-icon icons-sets" ng-class="{up:isPopupVisible }" ng-click="togglePopup()"></span>'+
	                    		'<ul ng-show="isPopupVisible">' +
	                             '<li class="search-filter" ng-click="searchfn" ng-show="filterStatus"> <input type="text" class="search-icon" ng-model="search.' + search_filter + '" placeholder="' + searchplaceholder + '"></li>' +
	                            '<li ng-repeat="item in filtered = (items | filter:search)" ng-click="setTab(item)">{{item.' + (attr.itemdisp == undefined ? attr.itemval : attr.itemdisp) + '}} </li>' +
	                            '<li ng-show="filtered.length == 0">' + tNoMatchText + '</li>' +
	                            '</ul>';
	                    }
	                
	            }
	              elem.append($compile(template)(scope));
	              var openPopup = false;
	              scope.$watch('isactive', function (newValue, oldValue) {
	                  if (newValue == undefined)
	                      return

	                  if (newValue == true && scope.selected != undefined) {
	                      if (scope.selected.length != 0) {
	                          scope.isactive2 = false;
	                      }
	                      else {
	                          scope.itemplaceholder = scope.acticemessage;
	                          scope.isactive2 = true;
	                      }
	                  }
	                  else {
	                      scope.itemplaceholder = scope.acticemessage;
	                      scope.isactive2 = true;
	                  }
	              });

	              scope.$watch('selected', function (newValue, oldValue) {
	                  scope.isactive2 = false;
	                if (scope.items) {
	                    if (scope.isSimpleArray) {
	                        for (var i = 0; i < scope.items.length; i++) {
	                            if (scope.items[i] == newValue) {
	                                scope.idx = i;
	                            }
	                        }
	                    }
	                    else if (scope.items instanceof Array) {
	                        for (var i = 0; i < scope.items.length; i++) {
	                            if (scope.items[i][attr.itemval] == newValue) {
	                                scope.idx = i;
	                            }
	                        }
	                    } else {
	                        scope.setTab(scope.items[newValue]);
	                    }
	                }
	            });

	            scope.setTab = function (item) {
	                var oldVal = scope.selected;
	                if (scope.isSimpleArray) {
	                    for (var i = 0; i < scope.items.length; i++) {
	                        if (scope.items[i] == item) {
	                            scope.idx = i;
	                            scope.selected = item;
	                        }
	                    }
	                }
	                else if (scope.items instanceof Array) {
	                    for (var i = 0; i < scope.items.length; i++) {
	                        if (scope.items[i][attr.itemval] == item[attr.itemval]) {
	                            scope.idx = i;                        
	                            if (scope.hasObj) {
	                                scope.selected = item;
	                            }
	                            else
	                            {
	                                scope.selected = item[attr.itemval];
	                            }
	                                
	                             
	                        }
	                    }
	                } else {
	                    scope.idx = scope.selected = item[attr.itemval];
	                }
	                if (oldVal !== undefined && oldVal != scope.selected) {
	                    scope.recordChanged({ value: scope.selected, parent: scope.$parent });
	                    if (attr['selectedobj'] == undefined) {
	                    	scope.onselectedchange();
	    	            }
	                    
	                }
	                scope.isPopupVisible = false;
	            };
	            scope.togglePopup = function() {
	                scope.isPopupVisible = !scope.isPopupVisible;
	                openPopup = scope.isPopupVisible;
	            }
	            scope.searchfn= function()
	            {
	                scope.isPopupVisible = true;
	            }
	            $document.bind('click', function (e) {
	                if (!(angular.element(e.target).hasClass("search-filter") || angular.element(e.target).parent().hasClass("search-filter"))) {
	                    if (!openPopup) {
	                        scope.isPopupVisible = false;
	                        scope.$apply();
	                    } else {
	                        openPopup = false;
	                    }
	                }

	            });
	        }

	      };
	  });

}());