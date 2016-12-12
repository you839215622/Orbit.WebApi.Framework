﻿'use strict';
app.controller('loginController', ['$scope', '$location', 'authService', 'AppSettings', function ($scope, $location, authService, AppSettings) {

    $scope.loginData = {
        userName: "",
        password: "",
        useRefreshTokens: false
    };

    $scope.message = "";

    $scope.disableFB = true;

    $scope.login = function () {

        authService.login($scope.loginData).then(function (response) {
            $scope.$emit('userAuthorized', true);
            $location.path('/orders');

        },
         function (err) {
             $scope.$emit('userAuthorized', false);
             if (err) {
                 if (err.error_description) {
                     $scope.message = err.error_description;
                 }

                 if (err.Message) {
                     $scope.message = err.Message;
                 }
             }
         });
    };

    $scope.authExternalProvider = function (provider) {

        var redirectUri = location.protocol + '//' + location.host + '/' + location.pathname + '/authcomplete.html';

        var externalProviderUrl = AppSettings.apiServiceBaseUri + "api/Account/ExternalLogin?provider=" + provider
                                                                    + "&response_type=token&client_id=" + AppSettings.clientId
                                                                    + "&redirect_uri=" + redirectUri;
        window.$windowScope = $scope;

        var oauthWindow = window.open(externalProviderUrl, "Authenticate Account", "location=0,status=0,width=600,height=750");
        oauthWindow.document.title = "Request for Permission";
    };

    $scope.authCompletedCB = function (fragment) {

        $scope.$apply(function () {
            if (fragment.registered_user == 'False') {

                authService.logOut();

                authService.externalAuthData = {
                    provider: fragment.provider,
                    userName: fragment.external_user_name,
                    externalAccessToken: fragment.external_access_token
                };

                $location.path('/associate');

            }
            else {
                //Obtain access token and redirect to orders
                var externalData = { provider: fragment.provider, externalAccessToken: fragment.external_access_token };
                authService.obtainAccessToken(externalData).then(function (response) {
                    $scope.$emit('userAuthorized', true);
                    $location.path('/orders');

                },
             function (err) {
                 $scope.$emit('userAuthorized', false);
                 if (err) {
                     if (err.error_description) {
                         $scope.message = err.error_description;
                     }

                     if (err.Message) {
                         $scope.message = err.Message;
                     }
                 }
             });
            }

        });
    }
}]);