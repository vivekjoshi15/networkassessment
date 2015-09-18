var UserLibrary = angular.module('apicemApp.userService', []);

UserLibrary.service('userService', ['$filter', function ($filter) {
    var userList = [
        { username: "admin", name: "Administrator", Userid: 1, password: "admin", userEmail: 'admin@cisco.com', role: "ADMIN" },
        { username: "user", name: "User", Userid: 2, password: "user", userEmail: 'user@cisco.com', role: "USER" },
    ];

    var addUser = function (item) {
        userList.push(item);
    }
    var getUserName = function () {
        var user = [];
        for (var i = 0; i < userList.length; i++) {
            user.push({ 'username': userList[i].username });
        }
        return user;
    }
    var getUsers = function () {
        return userList;
    }

    var getUser = function (Userid) {
        var found = $filter('filter')(userList, { Userid: parseInt(Userid) }, true);
        return found[0];
    }

    var editUser = function (Userid, item) {
        var found = $filter('filter')(userList, { Userid: parseInt(Userid) }, true);
        userList[userList.indexOf(found[0])] = item;
    }

    var removeUser = function (item) {
        userList.splice(userList.indexOf(item), 1);
        return userList;
    }
    var login = function (UserName,password) {
        var found = $filter('filter')(userList, { username: UserName, password: password }, true);
        return found[0];
    }

    return {
        login:login,
        addUser: addUser,
        getUsers: getUsers,
        removeUser: removeUser,
        getUser: getUser,
        editUser: editUser,
        getUserName: getUserName
    };
}]);