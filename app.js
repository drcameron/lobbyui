window.serverTime = 0;
window.apiURL = 'http://www.untap.in/apiv2.php';
window.uiVersion = '18'

	var untap = angular.module('untap', ['mm.foundation'])
	.filter('to_trusted', ['$sce', function($sce) {
        return function(text) {
			return $sce.trustAsHtml(text);
        };
    }]).filter('agotime', ['$sce', function($sce) {
        return function(time) {
        	var seconds = serverTime-parseInt(time);
        	var interval;
		    interval = Math.floor(seconds / 3600);
		    if (interval > 1) { return interval + " hours ago"; }
		    if (interval >= 1) { return interval + " hour ago"; }
		    interval = Math.floor(seconds / 60);
		    if (interval >= 1) { return interval + " minutes ago"; }
		    return Math.floor(seconds) + " seconds ago";
        };
    }]);

    untap.directive('helptip', function($position) {
    	return {
    		restrict: 'E',
    		scope: {
		      tip: "@"
		    },
    		template: '<span class="label secondary right" popover="{{tip}}" popover-trigger="mouseenter" popover-placement="left" >Help</span>'
    	}
    });

    untap.directive('upload', function() {
    	return {
    		restrict: 'E',
    		template: '<div><a class="button expand secondary small" ng-click="clickupload()">'+
    					'<i class="fi-upload"></i> {{upload}}'+
    					'</a>'+
    					'<div data-alert class="alert-box warning radius" ng-show="warning != \'\'">'+
						'  {{warning}}'+
						'</div>'+
    					'<input style="display: none;" type="file"></div>',
    		link: function(scope, elem, attrs) {
				scope.upload = 'Upload';
				scope.warning = '';
				var model = attrs.ctrlModel || uploadFile;
				scope.$parent[model] = { filename: '', data: '' };
    			scope.clickupload = function() {
    				inputF = elem.find('input[type="file"]');
    				textA = elem.find('textarea');
    				inputF.trigger('click').bind('change', function(e) {
						var input = this;
						
						if (input.files && input.files[0]) {
							scope.warning = '';
				            var reader = new FileReader();
				            reader.onload = function (e) {
				                var b64 = e.target.result.split(',')[1];
				                var byteSize = encodeURI(b64).split(/%..|./).length - 1;
				                var filename = $(input).val().replace(/^.*[\\\/]/, '');
				          		var ext = filename.split('.').pop();

				          		if(typeof attrs.fileExtentions != 'undefined') {
				          			if(jQuery.inArray( ext, attrs.fileExtentions.split(' ')) < 0) {
				          				console.log(attrs.fileExtentions.split(' '), ext, jQuery.inArray( ext, attrs.fileExtentions.split(' ')));
				          				scope.warning = 'File type invalid.';
				          			}
				          		}

				          		if(typeof attrs.maxSize != 'undefined') {
				          			if(byteSize > parseInt(attrs.maxSize)) {
				          				scope.warning = 'File too large.';
				          			}
				          		}
				          		console.log(filename, ext, byteSize);
				          		if(scope.warning == '') {
					          		//textA.val(b64);
					          		scope.$parent[model] = { filename: filename, data: b64 };
					          		scope.upload = 'Upload : ' + filename;
				          		}else{
				          			scope.$parent[model] = { filename: '', data: '' };
					          		scope.upload = 'Upload';
				          		}
				            }
				            reader.readAsDataURL(input.files[0]);
				        }
    				});
    			}
    		}
    	}	
    });
    
    //why i had to repeat this i have no idea, i lost patience trying to split out the scopes... bleh
    untap.directive('uploadfile', function() {
        return {
            restrict: 'E',
            template: '<div><a class="button expand secondary small" ng-click="clickuploadfile()">'+
                        '<i class="fi-upload"></i> {{uploadfile}}'+
                        '</a>'+
                        '<div data-alert class="alert-box warning radius" ng-show="warningfile != \'\'">'+
                        '  {{warningfile}}'+
                        '</div>'+
                        '<input style="display: none;" type="file"></div>',
            link: function(scope, elem, attrs) {
                scope.uploadfile = 'Upload';
                scope.warningfile = '';
                var model = attrs.ctrlModel || uploadFile;
                scope.$parent[model] = { filename: '', data: '' };
                scope.clickuploadfile = function() {

                    var inputF = elem.find('input[type="file"]');
                    var textA = elem.find('textarea');
                    inputF.trigger('click').bind('change', function(e) {
                        var input = this;
                        
                        if (input.files && input.files[0]) {
                            scope.warningfile = '';
                            var reader = new FileReader();
                            reader.onload = function (e) {
                                var b64 = e.target.result.split(',')[1];
                                var byteSize = encodeURI(b64).split(/%..|./).length - 1;
                                var filename = $(input).val().replace(/^.*[\\\/]/, '');
                                var ext = filename.split('.').pop();

                                if(typeof attrs.fileExtentions != 'undefined') {
                                    if(jQuery.inArray( ext, attrs.fileExtentions.split(' ')) < 0) {
                                        console.log(attrs.fileExtentions.split(' '), ext, jQuery.inArray( ext, attrs.fileExtentions.split(' ')));
                                        scope.warningfile = 'File type invalid.';
                                    }
                                }

                                if(typeof attrs.maxSize != 'undefined') {
                                    if(byteSize > parseInt(attrs.maxSize)) {
                                        scope.warningfile = 'File too large.';
                                    }
                                }
                                console.log(filename, ext, byteSize);
                                if(scope.warningfile == '') {
                                    //textA.val(b64);
                                    scope.$parent[model] = { filename: filename, data: b64 };
                                    scope.uploadfile = 'Upload : ' + filename;
                                }else{
                                    scope.$parent[model] = { filename: '', data: '' };
                                    scope.uploadfile = 'Upload';
                                }
                            }
                            reader.readAsDataURL(input.files[0]);
                        }
                    });
                }
            }
        }   
    });

    untap.controller('lobbyCtrl', function($scope, $http, $rootScope, $timeout, lobbyFeed, deckData) {
    	$scope.g = lobbyFeed;
    	$scope.decks = deckData;
    	$scope.template = 'templates/lobby.html?'+uiVersion;

        $scope.gen = { addfriendusername: '' };

    	$scope.sendChat = function(ev) {
    		if(ev.which == 13) {
    			var message = ev.target.value;
    			ev.target.value = '';
    			$rootScope.$broadcast('sendChat', message);
    			var postData = { action: 'sendChat', message: message }
    			$http.post(apiURL,  postData, {responseType:'json', withCredentials: true }).
		        	success(function(r, status) {});
    		}
    		if(ev.which == 38) {
				$scope.pmUser();
    		}
    	}

    	$scope.newGame = { action: 'startGame', players: 2 };
    	$scope.startTitle = 'Start Game';

    	$scope.goTo = function(url) {
	    	window.location.href = url;
	        window.location.assign(url);
	    }

    	$scope.startGame = function() {
    		$scope.gameAlert = false;

    		if(jQuery.inArray( $scope.newGame.gameType, $scope.decks.deckTypes ) < 0) {
    			$scope.gameAlert = { type: 'warning', message: 'Game Type not set' };
    			return;
    		}

    		if(($scope.g.serverStats.s1 == $scope.g.serverStats.s1Full)&&($scope.g.userData.donate != 'true')) {
    			$scope.gameAlert = { type: 'warning', message: 'No Available Servers' };
    			return;
    		}

    		var delayStart = function(t) {
    			if(t == 0) {
    				$scope.startTitle = 'Starting Game...';
    				$http.post(apiURL,  $scope.newGame, {responseType:'json', withCredentials: true }).
		        	success(function(r, status) {
		            	if(r.status == 'success') {
		            		$scope.gameAlert = { type: r.status, message: r.message };
		            		$timeout(function() {
		            			$scope.gameAlert = false;
		            			$scope.startTitle = 'Start Game';
		            		}, 3000);
		            	}else{
		            		$scope.gameAlert = { type: r.status, message: r.message };
		            		$scope.startTitle = 'Start Game';
		            	}
		        	});
    			}else{
    				t--;
    				$scope.startTitle = t;
    				$timeout(function() {
    					delayStart(t);
    				}, 1000);
    			}
    		}

    		var t = ($scope.g.userData.donate == 'true' ? 0 : 20);
    		delayStart(t);
    	}

    	$scope.joinGame = function(game) {

    		var password = '';

    		if(game.locked != 'false') {
    			var pass=prompt("Game Password",'');
			    if (pass!=null) {
			      password = pass;
			    }
    		}
    		$http.post(apiURL,  {
    			action: 'joinGame',
    			password: password,
    			host: game.host }, {responseType:'json', withCredentials: true }).
    		success(function(r, s) {});
    	}

    	$scope.leaveGame = function() {
    		$scope.g.userData.inGame = '';
    		$http.post(apiURL,  { action: 'leaveGame' }, {responseType:'json', withCredentials: true }).
    		success(function(r, s){});
    	}

    	$scope.quickPM = function(username) {
    		$scope.selectedUser = username;
    		$scope.pmUser();
    	}

    	$scope.clickUser = function(username) {
			$scope.selectedUser = username;
		}

		$scope.arFriend = function() {
			$http.post(apiURL,  {action: 'arFriend', username: $scope.selectedUser }, {responseType:'json', withCredentials: true }).
        	success(function(r, status) {
        		for(u in $scope.g.online) {
					if($scope.g.online[u].username == $scope.selectedUser) {
						$scope.g.online[u].friends = ($scope.g.online[u].friends == 'true' ? 'false' : 'true');
					}
				}
        	});
		}

        $scope.addFriend = function() {

            $http.post(apiURL,  {action: 'arFriend', username: $scope.gen.addfriendusername }, { responseType:'json', withCredentials: true }).
            success(function(r, status) {
                for(u in $scope.g.online) {
                    if($scope.g.online[u].username == $scope.selectedUser) {
                        $scope.g.online[u].friends = ($scope.g.online[u].friends == 'true' ? 'false' : 'true');
                    }
                }
            });
            $scope.gen.addfriendusername = '';
        }

		$scope.arBlock = function() {

			$http.post(apiURL,  {action: 'arBlock', username: $scope.selectedUser }, {responseType:'json', withCredentials: true }).
        	success(function(r, status) {
        		for(u in $scope.g.online) {
					if($scope.g.online[u].username == $scope.selectedUser) {
						$scope.g.online[u].blocks = ($scope.g.online[u].blocks == 'true' ? 'false' : 'true');
					}
				}
        	})
		}

		$scope.pmUser = function() {
			console.log($scope.selectedUser, 'pmUser');
			$('.exit-off-canvas').trigger('click');
			$('#chatter').val('@'+$scope.selectedUser+': '+$('#chatter').val()).focus();
		}

    	$scope.onloadTemp = function() {

    		adjustForNoScroll();

    		if($('#chatFeed').length > 0) {
    			baselineChat();
    			setTimeout(function(){
    				$(document).foundation();
    			}, 750);
    		}
    	}

    	$scope.changeTemplate = function(template) {
    		if($scope.template != template) {
    			$scope.template = 'templates/'+template+'.html?'+uiVersion;
    		}
    	}
    });

    untap.controller('loggedout', function($scope, $http, $rootScope, lobbyFeed) {
    	$scope.g = lobbyFeed;

    	$scope.register = function() {

    		if($scope.regPassword != $scope.regRePassword) {
    			$scope.regAlert = { type: 'warning', message: 'Passwords do not match' };
    			return;
    		}
    		$scope.showAlert = false;
    		$scope.regAlert = false;
    		var postData = {
    			action: 'createAccount',
    			username: $scope.regUsername,
    			password: $scope.regPassword,
    			email: $scope.regEmail
    		}

			$http.post(apiURL,  postData, {responseType:'json', withCredentials: true }).
        	success(function(r, status) {
            	if(r.status == 'success') {
            		$scope.regAlert = { type: r.status, message: r.message };

            		$scope.regUsername = '';
            		$scope.regEmail = '';
            	}else{
            		$scope.regAlert = { type: r.status, message: r.message };
            		
            	}
            	$scope.regPassword = '';
            	$scope.regRePassword = '';
        	});
    	}

    	$scope.forgotPass = false;

    	$scope.forgotChange = function(val) {
    		$scope.forgotPass = val;
    	}

    	$scope.forgotPassword = function() {
			var postData = { action: 'forgotPass', username: $scope.forgetUsername, email: $scope.forgetEmail }
    		$scope.showAlert = false;
    		$http.post(apiURL,  postData, {responseType:'json', withCredentials: true }).
        	success(function(r, status) {
            	if(r.status == 'success') {
            		$scope.showAlert = { type: r.status, message: r.message };
            	}else{
            		$scope.showAlert = { type: r.status, message: r.message };
            	}
        	});
    	}

    	$scope.login = function() {
    		var postData = { action: 'login', username: $scope.g.user, password: $scope.password }
    		$scope.showAlert = false;
    		$http.post(apiURL,  postData, {responseType:'json', withCredentials: true }).
        	success(function(r, status) {
            	if(r.status == 'success') {
            		$scope.showAlert = { type: r.status, message: r.message };
            		$rootScope.$broadcast('loginSuccess');
            	}else{
            		$scope.showAlert = { type: r.status, message: r.message };
            	}
            	$scope.password = '';
        	});
    	}
    	
    });


    //controllers for modals

    var genModalCtrl = function($scope, $modalInstance, lobbyFeed) {
    	$scope.g = lobbyFeed;
    	$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};

		$scope.anchor = function($event) {
			var find = $($event.target).text();
			$('html, body').animate({
		        scrollTop: $('h3:contains("'+find+'")').offset().top
		    }, 700);
		}
    }


    var ghModalCtrl = function($scope, $modalInstance, $http, lobbyFeed) {
        $scope.g = lobbyFeed;
        $scope.gameHistory = {};
        $http.post(apiURL,  { action: 'gameHistory' }, { responseType:'json', withCredentials: true }).
        success(function(r, status) {
            $scope.gameHistory.list = r;
        });

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }

    var modModalCtrl = function($scope, $modalInstance, $http, lobbyFeed) {
    	$scope.g = lobbyFeed;
        $scope.userBan = { action: 'userban' };
        $scope.killGame = { action: 'killGame' };
        $scope.userChange = { action: 'userChange' };
        $scope.showAlert = false;

        //console.log($scope.g);

        $scope.submitBan = function() {
            $scope.showAlert = false;
            $http.post(apiURL,  $scope.userBan, { responseType:'json', withCredentials: true }).
            success(function(r, status) {
                $scope.showAlert = { type: r.status, message: r.message };
            });
        }

        $scope.changeUsername = function() {
            $scope.showAlert = false;
            $http.post(apiURL,  $scope.userChange, { responseType:'json', withCredentials: true }).
            success(function(r, status) {
                $scope.showAlert = { type: r.status, message: r.message };
            });
        }

        $scope.submitKillGame = function() {
            $scope.showAlert = false;
            $http.post(apiURL,  $scope.killGame, { responseType:'json', withCredentials: true }).
            success(function(r, status) {
                $scope.showAlert = { type: r.status, message: r.message };
            });
        }

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }

    var accountModalCtrl = function($scope, $modalInstance, $http, lobbyFeed) {
    	$scope.g = lobbyFeed;
    	$scope.userData = jQuery.extend({}, lobbyFeed.userData );
    	$scope.dater = new Date().getTime();

    	$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};

		$scope.validateEmail = function() {
			$http.post(apiURL,  { action: 'validateEmail' }, { responseType:'json', withCredentials: true }).
			success(function(r, status) {
				$scope.showAlert = { type: r.status, message: r.message };
			});
		}

		$scope.saveProfile = function() {
			$scope.dater = new Date().getTime();
			$scope.showAlert = false;
			var postData = {
				action: 'updateUserData',
				email: $scope.userData.email,
				deckBack: $scope.userData.deckBack,
				password: $scope.userData.password,
				avatar: $scope.avatarUpload.data,
                deckbackUpload: $scope.deckbackUpload.data,
			}
			$http.post(apiURL,  postData, { responseType:'json', withCredentials: true }).
			success(function(r, status) {

				
				if(postData.avatar != '') {
					$scope.userData.avatar = $scope.userData.avatar + '?' + $scope.dater;
				}

                if(postData.deckBack.substr(0, 2) == 'c/') {

                    $scope.cancel();
                }

                $scope.showAlert = { type: r.status, message: r.message };
                console.log($scope.userData);
			});
		}

		window.pjh = $scope;
    }

    var deckModalCtrl = function($scope, $modalInstance, $http, $rootScope, $position, deckData, deckId) {
    	console.log(deckId);
    	if(deckId.split(' ')[0] == 'new') {
    		$scope.deck = { 
    			deckId: 'new',
    			type: deckId.split(' ')[1],
    			textdeck: {
    				main: '', main2: '', hand: '', play: '', sb: '', alt: ''
    			}
    		};
    	}else{
    		$scope.deck = jQuery.extend({}, deckData.list[deckId] );
    	}
    	
    	$scope.$on('doneDeckReload', function(event) {
    		$scope.deck = jQuery.extend({}, deckData.list[$scope.deck.deckId] );
    	});

    	$scope.saveDeck = function() {
    		$scope.showAlert = false;
    		var postData = {
				action: 'saveDeck',
				deckId: $scope.deck.deckId,
				deckType: $scope.deck.type,
				deckCards: $scope.deck.textdeck.main,
				deck2Cards: $scope.deck.textdeck.main2,
				handCards: $scope.deck.textdeck.hand,
				playCards: $scope.deck.textdeck.play,
				sideboardCards: $scope.deck.textdeck.sb,
				altCards: $scope.deck.textdeck.alt,

				deckName: $scope.deck.name,
				fetchUrl: $scope.deck.fetchUrl,
				uploadDeck_support: $scope.deckUpload.filename,
				uploadDeck: $scope.deckUpload.data,
			}
    		$http.post(apiURL,  postData, { responseType:'json', withCredentials: true }).
        	success(function(r, status) {
				$scope.showAlert = { type: r.status, message: r.message };
				if(r.status == 'success') {
					$scope.deck.deckId = r.deckId;
					console.log(r.deckId)
					$rootScope.$broadcast('reloadDecks');
				}
            	$scope.deck.fetchUrl = '';
            	console.log(r);
        	});
    	}

    	$scope.deleteDeck = function(deldeckId) {
    		var r=confirm("Delete this deck?");
			if (r==true) {
				$http.post(apiURL,  { action: 'deleteDeck', deckId: deldeckId }, { responseType:'json', withCredentials: true }).
    			success(function(r, status) {
    				$rootScope.$broadcast('reloadDecks');
    				$scope.cancel();
    			});
			}
    	}

    	$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};
    }

    // userBar controller will control all lobbyFeed data for all other controllers
    untap.controller('userBar', function($scope, $q, $http, $timeout, $modal, $rootScope, lobbyFeed, deckData) {
    	$scope.g = lobbyFeed;
    	$scope.decks = deckData;

    	$scope.logout = function() {
    		$scope.g.userData.username = 'null';

			$http.post(apiURL,  { action: 'logout' }, { responseType:'json', withCredentials: true }).
        	success(function(r, status) {
            	if(r.status == 'success') {
            		console.log('User Logged Out');
            	}
        	});
		}

		$scope.accountModal = function() {
			var modalInstance = $modal.open({
				templateUrl: 'templates/accountModal.html?'+uiVersion,
				controller: accountModalCtrl
			});
		}

		$scope.modModal = function() {
			var modalInstance = $modal.open({
				templateUrl: 'templates/mod.html?'+uiVersion,
				controller: modModalCtrl
			});
		}

        $scope.ghModal = function() {
            var modalInstance = $modal.open({
                templateUrl: 'templates/gamehistory.html?'+uiVersion,
                controller: ghModalCtrl
            });
        }

        $scope.openFriends = function() {
            $('.left-off-canvas-toggle').click();
        }

		$scope.genModal = function(which) {
			var modalInstance = $modal.open({
				templateUrl: 'templates/'+which+'.html?'+uiVersion,
				controller: genModalCtrl,
				opened: function () {
	              alert('The couch was stolen!');
	          	}
			});
		}

		$scope.deckModal = function(deckId) {
			console.log(deckId);
			var modalInstance = $modal.open({
				templateUrl: 'templates/deckModal.html?'+uiVersion,
				controller: deckModalCtrl,
				resolve: {
					deckId: function () {
			        	return deckId;
			        }
				}
			});
		}

		$scope.$on('sendChat', function(event, message) {
			$scope.g.chat['deleteme'] = {
				type: 'chat',
				usertype: $scope.g.userData.usertype,
				chatId: 'deleteme',
				username: $scope.g.userData.username,
				message: message,
				gtime: window.serverTime
			}
			baselineChat();
		});

		$scope.getUpdates = function() {
			$http.post(apiURL,  { action: 'updatesFeed' }, { responseType:'json', withCredentials: true })
			.success(function(r, status) {
				$scope.updateFeed = r;
			})
		}

		$scope.getDecks = function() {
			$http.post(apiURL,  { action: 'deckData' }, { responseType:'json', withCredentials: true })
			.success(function(r, status) {
				$scope.decks.list = r;
				$scope.deckCount = Object.keys(r).length;

				var typeList = [];
				for(d in $scope.decks.list) {
					typeList.push($scope.decks.list[d].type);
				}
				$scope.decks.deckTypes = typeList.filter(function (e, i, arr) {
				    return arr.lastIndexOf(e) === i;
				});
				$rootScope.$broadcast('doneDeckReload');
			});
		}

    	$scope.fetch = function(obj, count) {
        	var q = $q.defer()
        	$http.post(apiURL,  { action: 'lobbyFeed', count: count }, { responseType:'json', withCredentials: true })
			.success(function(r, status) {
				var k = 0;

				for(i in r.chat) {
	        		if(typeof obj.chat[i] == 'undefined') {
	        			delete obj.chat['deleteme'];
	        			obj.chat[i] = r.chat[i];
	        			baselineChat();

	        		}else{
	        			obj.chat[i].gtime = r.chat[i].gtime;
	        		}
	        	}

	        	if(JSON.stringify(obj.userData) != JSON.stringify(r.userData)) { obj.userData = r.userData; }
	        	//if(JSON.stringify(obj.gameList) != JSON.stringify(r.gameList)) { obj.gameList = r.gameList; }

	        	obj.specList = syncArrObj(obj.specList, obj2arr(r.specList), 'gameId', 'sync');
	        	obj.gameList = syncArrObj(obj.gameList, obj2arr(r.gameList), 'gameId', 'sync');
	        	
	        	if(typeof r.online != 'undefined') { // catch blanks from odd count
		        	//if(JSON.stringify(obj.friends) != JSON.stringify(r.friends)) { obj.friends = r.friends; }
		        	obj.friends = syncArrObj(obj.friends, obj2arr(r.friends), 'username', 'sync');
		        	//if(JSON.stringify(obj.blocks) != JSON.stringify(r.blocks)) { obj.blocks = r.blocks; }
		        	obj.blocks = syncArrObj(obj.blocks, obj2arr(r.blocks), 'username', 'sync');
		        	//if(JSON.stringify(obj.online) != JSON.stringify(r.online)) { obj.online = r.online; }
		        	obj.online = syncArrObj(obj.online, obj2arr(r.online), 'username', 'sync');

		        	obj.serverStats = r.serverStats;

		        	adjustForNoScroll();
		        }
		        if(typeof r.user != 'undefined') {
		        	obj.user = r.user;
		        }

		        if(typeof obj.userData.inGame == 'object') {
		        	if(obj.userData.inGame.full == true) {
			        	sounds.alert();
			        }
		        }

	        	window.serverTime = parseInt(r.serverTime);

	        	if(obj.userData.username == 'null') {
	        		var loggedin = false;
	        	}else{
	        		var loggedin = true;
	        	}
	        	q.resolve(loggedin);
				
			}).error(function(){
				console.log('failed');
				$timeout(function(){
					loop(0);
				}, 5000);
			});

        	return q.promise;
        }

    	var loop = function (loopCount) {
        	if(loopCount == 0) {
        		var loopTime = 1;
        	}else if(loopCount == 1){
                $scope.getDecks();
                $scope.getUpdates();
        		var loopTime = 3000;
        	}else{
                var loopTime = 3000;
            }
        	$timeout(function(){
	        	$scope.promise = $scope.fetch($scope.g, loopCount);
		        loopCount++;
		        $scope.promise.then(
		        	function(v) {
		        		if(v) {
		        			loop(loopCount);
		        		}
		        	}
		        );
	        }, loopTime);
        }
        loop(0);

        $scope.$on('loginSuccess', function(event) { loop(0); });
        $scope.$on('reloadDecks', function(event) { $scope.getDecks() });
        window.userData = $scope.g;
        window.deckData = $scope.decks;
    });

    //factory for lobbyFeed this will set up the object template ready for resource sharing.
    untap.factory('lobbyFeed', function() {
    	return {
            chat: {},
            blocks: [],
            friends: [],
            online: [],
            specList: [],
            userData: {
            	username: 'null' //set default as null for no login.
            },
            gameList: [],
            serverStats: [],
            user: ''
        }
    });

    untap.factory('deckData', function() {
    	return {
    		list: {},
    		deckCount: 0,
    		deckTypes: []
    	}
    });

    function syncArrObj(client, server, key, type) {
        var inObjectArray = function(key, value, arr) {
            for (i in arr) if (arr[i][key] == value) return true;
            return false;
        }

        if(type == 'sync') {
            var c = client.length
            while (c--) if(!inObjectArray(key, client[c][key], server)) client.splice(c, 1);
        }
        for(s in server) if(!inObjectArray(key, server[s][key], client)) client.push(server[s]);
        return client;
    }

    function obj2arr(obj) {
    	var arr = obj
    	for(i in obj) arr.push(obj[i]);
    	return arr;
    }

    function makeid() {
	    var text = "";
	    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	    for( var i=0; i < 10; i++ )
	        text += possible.charAt(Math.floor(Math.random() * possible.length));
	    return text;
	}

    function baselineChat() {
    	if(typeof $('#chatFeed')[0] == 'undefined') return;
    	if(($('#chatFeed')[0].scrollHeight != 0)&&($('#chatFeed')[0].scrollHeight-($('#chatFeed').scrollTop()+$('#chatFeed').height()) > 70)) {
    		return false;
    	}
		if($('#chatFeed').length < 1) return false;
    	clearTimeout(window.scrollDowner);
		window.scrollDowner = setTimeout(function() {
			$('#chatFeed').scrollTop($('#chatFeed')[0].scrollHeight);
		}, 100);
    }

    function adjustForNoScroll() {
    	//fix caht height window height with no scroll
		$('#chatFeed').height($(window).height()-($('#menuTopBar')
			.outerHeight()+$('#menuLobbyBar')
			.outerHeight()+$('#chatter')
			.outerHeight()+38));

		$('#downUpdates>div').css({ 'max-height': $('#chatFeed').height()-15 });
		$('#gamesPanel').css({ 'max-height': $('#chatFeed').height()-15 });

		baselineChat();
    }

    tabHidden = function() {
        var l = ['hidden', 'mozHidden', 'msHidden', 'webkitHidden'];
        for(c in l) { if(typeof document[l[c]] !== "undefined") { return document[l[c]]; } }
    }

    var sounds = {
        sndAlert: new Audio("sounds/alert.wav"),
        canAlert: true,
        canSound: true,
        pullforward: false,
        alert: function() {
            if(!tabHidden()) return false;
            if(sounds.canAlert) {
                sounds.canAlert = false;
                if(sounds.canSound) {
                    sounds.sndAlert.play();
                    sounds.canSound = false;
                    setTimeout(function(){ canAlert = true; }, 30000);
                }
                var link = document.createElement('link');
                link.type = 'image/x-icon';
                link.rel = 'shortcut icon';
                link.href = 'images/32alert.ico';
                document.getElementsByTagName('head')[0].appendChild(link);
                setTimeout(function() {
                    sounds.canAlert = true;
                    var link = document.createElement('link');
                    link.type = 'image/x-icon';
                    link.rel = 'shortcut icon';
                    link.href = 'images/32.ico';
                    document.getElementsByTagName('head')[0].appendChild(link);
                }, 3000);
            }
        }
    }
    

    

    $(function(){
    	window.onresize = function(event) {
    		adjustForNoScroll();
    	}
    });

	$(document).foundation();
	// $(function(){
	// 	$('#chatFeed').height($(window).height()-($('#menuTopBar').outerHeight()+$('#menuButtons').outerHeight()+$('#menuLobbyBar').outerHeight()+$('#chatter').outerHeight()+20));
	// });
    var doc = document.documentElement;
    doc.setAttribute('data-useragent', navigator.userAgent);

