var app = angular.module('trand');
app.controller('combinationsController', combinations);
app.$inject = ['$http', '$scope', '$location', 'userService', '$sce', 'collectionsService', '$timeout'];

function combinations($http, $scope, $location, userService, $sce, $rootScope, collectionsService, $timeout) {
  var vm = this;
  $scope._ = _;

  // 'use strict';

  $scope.posX = 0;
  $scope.posY = 0;

  $scope.moveX = function (pixels) {
    $scope.posX = $scope.posX + pixels;
  };
  $scope.moveY = function (pixels) {
    $scope.posY = $scope.posY + pixels;
  };
  $scope.$evalAsync(function () {
    $scope.$broadcast('content.changed', 1000);
  });

  $scope.center = function () {
    $scope.posX = 600;
    $scope.posY = 410;
  };

  $scope.last = function (name) {
    var theOne = _.where($rootScope.queryLists, {name: name});
    if ((theOne[0].index)===0) {
      theOne[0].index = theOne[0].data.length - 1 ;
    } else {
      theOne[0].index -- ;
    }
    theOne[0].imgUrl = theOne[0].data[theOne[0].index].item.image.sizes.Best.url;
  }

  $scope.next = function (name) {
    var theOne = _.where($rootScope.queryLists, {name: name});
    if ((theOne[0].index + 1) === theOne[0].data.length) {
      theOne[0].index = 0;
    } else {
      theOne[0].index ++ ;
    }
    theOne[0].imgUrl = theOne[0].data[theOne[0].index].item.image.sizes.Best.url;
  }

  $scope.showInBox = function (name) {
    var theOne = _.where($rootScope.queryLists, {name: name});
    theOne[0].show = !theOne[0].show;
  }

  $scope.setPosition = function (name) {
    var theOne = _.where($rootScope.queryLists, {name: name});
    var current = document.getElementById('combox-'+ name + '-draggable');
    theOne[0].position = current.getAttribute('style');
    console.log(theOne[0].position);
  }

  $scope.select = function (name, index) {
    var theOne = _.where($rootScope.queryLists, {name: name});
    theOne[0].index = index;
    theOne[0].imgUrl = theOne[0].data[theOne[0].index].item.image.sizes.Best.url;
  }
  vm.newComb = function () {
    var json ={
      combinations: {
        fullbody: vm.fullbody[$rootScope.query.fullbody].item
      }
    }
    var newComb = $http.post('/combinations/new', json);
    newComb.then(function (response) {
      getCombinations();
    })
  }
  vm.getCollectionsOf = function (sort, index) {
    var collections = collectionsService.getCollections(sort);
    collections.then(function (res) {
      var added = _.where($rootScope.queryLists, {name: sort});
      if (added.length == 0) {
        var object = {
          order: index,
          name: sort,
          data: res.data,
          index: 0,
          show: true,
          imgUrl: res.data[0].item.image.sizes.Best.url,
        }
        if (sort === 'top') {
          object.position = 'left: 350px';
        }
        if (sort === 'bot') {
          object.position = 'left: 350px; top: 350px';
        }
        if (sort === 'fullbody') {
          object.show = false;
          object.position = 'right: 15px; top:15px;'
        }
        if (sort === 'foot') {
          object.position = 'right: 15px; bottom: 15px;';
        }
        if (sort === 'head') {
          object.show = false;
          object.position = 'left: 15px; top: 15px;';
        }
        if (sort === 'eye') {
          object.position = 'left: 15px; top: 200px;';
        }
        if (sort === 'neck') {
          object.show = false;
          object.position = 'left:15px; top:300px;'
        }
        if (sort === 'bags') {
          object.position = 'left: 15px; bottom: 15px;';
        }
        $rootScope.queryLists.push(object);
      }
    })
  }

  vm.savePic = function () {
    html2canvas($("#comb-canvas"), {
      allowTaint: true,
      logging:true,
      onrendered: function(canvas) {
        // document.body.appendChild(canvas);
        // $("#img-out").append(canvas);
        canvas.toBlob(function(blob) {
            saveAs(blob, "comb-canvas.png");
        });
      }
    });
  }

  function getCombinations() {
    var getComb = $http.get('/combinations');
    getComb.then(function (res) {
      vm.combs = res.data;
    })
  }

  vm.maker = function () {
    $scope.maker = true;
    $scope.ready = false;
    getCombinations();

    var bodyParts = ['top', 'bot', 'fullbody', 'foot',
                 'neck', 'head', 'eye', 'bags'];
    for (var i = 0; i < bodyParts.length; i++) {
      vm.getCollectionsOf(bodyParts[i], i);
    }
    $scope.posX = 0;
    $scope.posY = 0;

    $scope.$broadcast('content.changed');
    $scope.$broadcast('content.reload');

    $timeout(function(){
      var array = ['top', 'bot', 'fullbody', 'foot', 'eye', 'head', 'neck', 'bags'];
      for (var i = 0; i < array.length; i++) {
        $( "#combox-" + array[i] + "-draggable").draggable({ containment: "#combox-wrapper", scroll: false });
        $( "#combox-" + array[i] + "-draggable" ).resizable({containment: "#combox-wrapper", autoHide: true});
      }
      $scope.ready = true;
    }, 2000);
  }
  function activate() {
  }
  activate();
}

app.directive('maker', function () {
  return {
    templateUrl: 'combinations/maker.html'
  }
})
app.directive('thumbs', function () {
  return {
    templateUrl: 'combinations/thumbs.html'
  }
})
