<?php

// Home page
$app->get('/', function () use ($app) {
	return $app['twig']->render('layout.twig');
});

