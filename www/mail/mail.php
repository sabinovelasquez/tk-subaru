<?php
# Include the Autoloader (see "Libraries" for install instructions)
require 'vendor/autoload.php';
use Mailgun\Mailgun;

# Instantiate the client.
$mgClient = new Mailgun('key-105c799b400d22df23f6de2ffb39fd87');
$domain = "mg.zetabyte.cl";

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Accept");

if($_POST)
{
    // $to_Email       = "daniel.korenblit@indumotora.cl, sabinovelasquez@gmail.com, juandedios@toolkit.cl";
    $to_Email       = "seba.sch999@gmail.com, sabinovelasquez@gmail.com";
    $subject        = '[Subaru] Un nuevo dispositivo ha aceptado el desafio.'; 

    try {
		# Make the call to the client.
		$result = $mgClient->sendMessage($domain, array(
		    'from'    => 'Desafío Subaru <subaru@mg.zetabyte.cl>',
		    'to'      => $to_Email,
		    'subject' => $subject,
		    'text'    => 'Notificacion -> El dispositivo Nro:'.$_POST["phone_id"].' ha aceptado el desafio de la ubicacion: '.$_POST["location"].' .'
		));

        if(!$result)
        {
            $output = json_encode(array('type'=>'error', 'text' => 'Error al enviar el correo'));
            die($output);
        }else{
            $output = json_encode(array('type'=>'message', 'text' => 'Correo enviado', 'response' => $result, 'request' => $_POST));
            die($output);
        }

    } catch(Mailgun $e) {
        // Mailgun errors are thrown as exceptions
        echo 'A Mailgun error occurred: ' . $e->getMessage();
        throw $e;
    }


}
?>