module.exports = function(app, passport) {
 app.get('/', function(req, res){
  res.render('index.ejs');
 });

 app.get('/login', function(req, res){
  res.render('login.ejs', {message:req.flash('loginMessage')});
 });

 app.post('/login', passport.authenticate('local-login', {
  successRedirect: '/localizacion',
  failureRedirect: '/login',
  failureFlash: true
 }),
  function(req, res){
   if(req.body.remember){
    req.session.cookie.maxAge = 1000 * 60 * 3;
   }else{
    req.session.cookie.expires = false;
   }
   res.redirect('/');
  });

 app.get('/login', function(req, res){
  res.render('login.ejs', {message: req.flash('signupMessage')});
 });

 app.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/menu',
  failureRedirect: '/login',
  failureFlash: true
 }));


app.get('/menu', isLoggedIn, function(req, res){
    res.render('Localizacion.ejs', {
     user:req.user
    });
});
app.get('/localizacion', function(req, res){
    res.render('Localizacion.ejs', {
     user:req.user
    });
});
app.get('/Regislocalizacion', function(req, res){
    res.render('Localizacion.ejs', {
     user:req.user
    });
});

//aqui se hace la consulta a la base de datos para mostrar las empresas
var mysql = require('mysql');
var dbconfig = require('../config/database');
var bcrypt = require('bcrypt-nodejs');
var connection = mysql.createConnection(dbconfig.connection);
connection.query('USE ' + dbconfig.database);

app.get('/dashboard/:codigo_empresa', function (req, res) {
    var a=req.params.codigo_empresa;
    //console.log(a);
    connection.query(`SELECT * FROM tbl_empresa_transporte WHERE cod_empresa=${a}`,
        function(err, resul){
            console.log(resul);
        res.render('dashboard.ejs', {
            empresas: resul,
            user:req.user
        });
    });
});
app.get('/dashboard', function (req, res) {
    connection.query("SELECT * FROM tbl_empresa_transporte",
        function(err, resul){
            //console.log(resul[0]);
        res.render('dashboard.ejs', {
            empresas: resul,
            user:req.user
        });
    });
});
app.get('/rutas2', function (req, res) {
    connection.query("SELECT * FROM new_rutas",
    function(err, resul, fields){
        res.render('rutas.ejs', {
            ruta: resul,
            user:req.user
        });
    });
});
app.get('/profile/:codigo_empresa', function (req, res) {
    var a=req.params.codigo_empresa;
    //console.log(a);
    connection.query(`SELECT * FROM tbl_empresa_transporte WHERE cod_empresa=${a}`,
        function(err, resul){
            console.log(resul);
        res.render('profile.ejs', {
            empresas: resul,
            user:req.user
        });
    });
});


// app.get('/profile', function (req, res) {
//     connection.query("SELECT * FROM tbl_usuario", function (err, resul) {
//         console.log(resul[0]);
//         res.render('profile.ejs', {
//             usuarios: resul,
//             user: req.user
//         });
//     });
// });
app.get('/registroUsuarios', function(req, res){
    res.render('registro-usuarios.ejs',{
        user:req.user
       });
    res.end();
    
});


app.post("/guardar", function (req, res) {
    connection.query(`
        INSERT INTO tbl_persona (cod_genero,telefono, nombre_persona, apellido_persona) 
        VALUES (?,?,?,?)`,
        [req.body.genero,req.body.telefono, req.body.nombre, req.body.apellidos],
        function (error, data, fields) {
            res.send(data);
            res.end();
        }
    );
    
});
app.post("/guardarUsua", function (req, res) {
    console.log(req.body.id, req.body.password,req.body.email);

    connection.query(`
        INSERT INTO tbl_usuario (id, username, password) 
        VALUES (?,?,?)`,
        [req.body.id, req.body.email, bcrypt.hashSync(req.body.password, null, null)],
        function (error, data, fields) {
            res.send(data);
            //console.log(data);
            res.end();
        }
    );
    
});

app.get('/comprar/:codigo_empre/:cod_ruta', function (req, res) {
    var a=req.params.codigo_empre;
    var b=req.params.cod_ruta;
    //console.log(a);
    //console.log(b);
    res.render('registrotarjeta-modal.ejs', {
                user:req.user,
                a,
                b
            });
});
app.get('/comprar', function (req, res) {
    //console.log(a);
    //console.log(b);
    res.render('compra.ejs', {
                user:req.user
            });
});


app.post("/buscar", function(req, res){
    connection.query("SELECT a.cod_empresa, b.nombre_empresa, c.nombre_lugar FROM tbl_sucursal a INNER JOIN tbl_empresa_transporte b ON (a.cod_empresa = b.cod_empresa) INNER JOIN tbl_lugar c ON (a.tbl_lugar_cod_lugar = c.cod_lugar) WHERE lower(c.nombre_lugar) = lower(?)", [req.body.buscar],
    function(error, data, fields){
        //console.log(data);
        res.send(data);
        res.end();
    
    });
});

app.post("/rutas", function(req, res){
    //console.log(req.body.id);
    connection.query("SELECT  c.cod_ruta,b.cod_empresa, b.nombre_empresa,c.Origen, c.Destino FROM tbl_ruta_x_empresa a INNER JOIN tbl_empresa_transporte b on (a.cod_empresa= b.cod_empresa)    INNER JOIN (SELECT a.cod_ruta AS cod_ruta, b.nombre_lugar AS Origen, c.nombre_lugar AS Destino FROM tbl_ruta a INNER JOIN tbl_lugar b on (a.cod_lugar_origen=b.cod_lugar) INNER JOIN tbl_lugar c on (a.cod_lugar_destino=c.cod_lugar)) c on (a.cod_ruta=c.cod_ruta) WHERE a.cod_empresa  = ?", [req.body.id],
    function(error, data, fields){
        res.send(data);
        res.end();
    });
});

app.post("/comprarboleto", function (req, res) {
    connection.query(`
        INSERT INTO tbl_compra (cod_usuario, cod_ruta, fecha_vencimiento, numero_tarjeta,csv) 
        VALUES (?, ?, ?, ?, ?)`,
        [req.body.cod_usuario,req.body.ruta, req.body.fecha, req.body.numtarjeta,req.body.csv],
        function (error, data, fields) {
            res.send(data);
            res.end();
        }
    );
    
});

app.get('/travel/:codigo_empres', function (req, res) {
   var codigo=req.params.codigo_empres;
    connection.query(`  SELECT  c.cod_ruta, b.cod_empresa, b.nombre_empresa, c.Origen, c.Destino, c.Hora, c.Duracion AS Duracion_Hr
                        FROM tbl_ruta_x_empresa a 
                        INNER JOIN tbl_empresa_transporte b 
                        on (a.cod_empresa= b.cod_empresa)
                        INNER JOIN (SELECT a.cod_ruta AS cod_ruta, b.nombre_lugar AS Origen, c.nombre_lugar AS Destino,
                                    d.hora AS Hora, a.Duracion AS Duracion  
                                    FROM tbl_ruta a 
                                    INNER JOIN tbl_lugar b 
                                    on (a.cod_lugar_origen=b.cod_lugar)
                                    INNER JOIN tbl_lugar c 
                                    on (a.cod_lugar_destino=c.cod_lugar)
                                    INNER JOIN tbl_hora d 
                                    on (a.cod_hora=d.cod_hora)) c 
                        on (a.cod_ruta=c.cod_ruta)
                        WHERE a.cod_empresa=${codigo}`,
        function(err, resul){
            console.log(resul);
             res.render('travel.ejs', {
            descripRutas: resul,
            user:req.user
        });
    });
});

 app.get('/logout', function(req,res){
  req.logout();
  res.redirect('/login');
 })
};



function isLoggedIn(req, res, next){
 if(req.isAuthenticated())
  return next();

 res.redirect('/');
}


