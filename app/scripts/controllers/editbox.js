'use strict';

angular.module('openSenseMapApp')
  .controller('EditboxCtrl', ['$scope', 'Validation', '$http',
  	function($scope, Validation, $http){

  	$scope.editingMarker = angular.copy($scope.$parent.selectedMarker);
  	console.log($scope.editingMarker);

  	$scope.boxPosition = {
	  lng: $scope.editingMarker.loc[0].geometry.coordinates[0],
	  lat: $scope.editingMarker.loc[0].geometry.coordinates[1],
	  zoom: 13
	};
	$scope.editMarker = {
        m1: {
            lng: $scope.boxPosition.lng,
            lat: $scope.boxPosition.lat,
            draggable: true
        }
    };
    $scope.$on('leafletDirectiveMarker.dragend', function (e, args) {
		$scope.editMarker.m1.lng = args.model.lng;
		$scope.editMarker.m1.lat = args.model.lat;
	});
	$scope.editMapDefaults = angular.copy($scope.defaults);
	$scope.editMapDefaults.scrollWheelZoom = false;

  	$scope.apikey = {};
	$scope.enableEditableMode = function () {
		var boxId = $scope.editingMarker._id;

		Validation.checkApiKey(boxId,$scope.apikey.key).then(function(status){
			$scope.apikeyIssue = false;
			if (status === 200) {
				$scope.editableMode = true;
				$scope.apikeyIssue = false;
			} else {
				$scope.apikeyIssue = true;
				$scope.editableMode = false;
			}
		});
	};

	$scope.saveChange = function (event) {
  		console.log("Saving change");
  		var boxid = $scope.editingMarker._id;
  		var imgsrc = angular.element(document.getElementById('flowUploadImage')).attr('src');
  		var newBoxData = {
  			_id: $scope.editingMarker._id,
  			name: $scope.editingMarker.name,
  			sensors: $scope.editingMarker.sensors,
  			description: $scope.editingMarker.description,
  			weblink: $scope.editingMarker.weblink,
  			grouptag: $scope.editingMarker.grouptag,
  			exposure: $scope.editingMarker.exposure,
  			loc: $scope.editMarker.m1,
  			image: imgsrc
  		};
  		console.log(JSON.stringify(newBoxData));

  		$http.put($scope.osemapi.url+'/boxes/'+boxid, newBoxData, { headers: { 'X-ApiKey': $scope.apikey.key } })
  		.success(function(data, status){
  			//$scope.editableMode = false;
  			$scope.editingMarker = data;
  			if (data.image === "") {
  				$scope.image = "placeholder.png";
  			} else {
  				$scope.image = data.image;
  			}
  		}).error(function(data, status){
			// todo: display an error message
		});
  	};

  	$scope.flowFileAdded = function(file,event) {
		if ((file.getExtension().toLowerCase() === "jpg" || file.getExtension().toLowerCase() === "png" || file.getExtension().toLowerCase() === "jpeg") && file.size < 512000) {
			return true;
		} else {
			return false;
		}
	};

	$scope.logThis = function() {
		console.log($scope.editingMarker);
	};

	$scope.addSensor = function() {
		$scope.editingMarker.sensors.push({
			sensorType: '',
			title: '',
			unit: '',
			editing: true,
			new: true
		});
	};

	$scope.editSensor = function(sensor) {
		sensor.restore = angular.copy(sensor);
		sensor.editing = true;
	};

	$scope.saveSensor = function(sensor) {
		if(sensor.name === "" || sensor.sensorType === "" || sensor.unit === "") {
			alert("Please fill all fields");
			return false;
		} else {
			sensor.editing = false;
		}
	};

	$scope.deleteSensor = function(sensor) {
		var index = $scope.editingMarker.sensors.indexOf(sensor);
		if(index !== -1) {
			$scope.editingMarker.sensors.splice(index, 1);
		}
	};

	$scope.cancelSensor = function(sensor) {
		if(sensor.name === "" || sensor.sensorType === "" || sensor.unit === "") {
			$scope.deleteSensor(sensor);
		} else {
			sensor.editing = false;
		}
	};

	$scope.downloadArduino = function () {
		var boxid = $scope.editingMarker._id;
		$http.get($scope.osemapi.url+'/boxes/'+boxid+'/script', { headers: { 'X-ApiKey': $scope.apikey.key } })
  		.success(function(data, status){
  			$scope.boxScript = data;
  		}).error(function(data, status){
			// todo: display an error message
		});
	}
}]);