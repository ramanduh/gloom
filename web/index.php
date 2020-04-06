<?php

require_once __DIR__.'/../vendor/autoload.php';

$app = new Silex\Application();

// Enable debug mode
$app['debug'] = true;

$app->register(new Silex\Provider\TwigServiceProvider(), array(
	'twig.path' => __DIR__.'/../views',
));

require __DIR__.'/../app/app.php';
require __DIR__.'/../app/routes.php';

$app->run();
