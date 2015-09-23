var as = angular.module('apicemApp.devices', [ 'smart-table', 'ui.utils', 'ui.select', 'xeditable','ngMessages','ui.bootstrap','ui.select2' ]);

as.controller('SearchController', function($scope, $rootScope, $http, i18n, $location, DeviceData, $window, $filter,log) {
	$scope.currentDate = Date.now();
	DeviceData.setCurrentDate($scope.currentDate);
	$scope.originalData = '';
	$scope.deviceCategory = 'all';
	$scope.itemsPerPage = "10";
	$scope.groupBy = 'groupBy_deviceType';
	var groupType = $scope.groupBy;
	$scope.devicesTypes =[
	                      {"text":'All Devices(Including Unknown Devices)',value:'all'},
	                      {"text":'Cisco Devices',value:'Cisco'},
	                      {"text":'Routers',value:'ROUTER'},
	                      {"text":'Switches',value:'SWITCH'},
	                      {"text":'Wireless',value:'WIRELESS'}
	                     ];
	$scope.itemPerPages = [
	                       {'text':5, val:5},
	                       {'text':10, val:10},
	                       {'text':20, val:20},
	                       {'text':30, val:30},
	                       {'text':50, val:50}
	                      ]

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
			$scope.itemPerPages.push({'text':'All', val:data.length});
			$scope.itemInitPerPage={'text':'All', val:data.length};
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

as.controller('ReplaceCtrl', function($scope, $http, $routeParams, i18n, $location, DeviceData, $filter, $window) {

	$scope.path = '/' + $routeParams.platformId;
	$scope.itemPerPages = [
	                       {'text':5, val:5},
	                       {'text':10, val:10},
	                       {'text':20, val:20},
	                       {'text':30, val:30},
	                       {'text':50, val:50}
	                      ]
	
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
		$scope.itemPerPages.push({'text':'All', val:$scope.allDevices.length});
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