$(document).ready(function () {
    const BASE_URL = "http://localhost:8000/api"
    var actiune = 'start';
    var intrebare = '';
    var raspuns = '';
    var nr_intrebare = 5;
    var punctaj = 0;
    var punctaj_total = 0;
    var exista_info = undefined;
    function afis_nr_intrebare(nr) {
        $('#nr_intrebari').text('Mai ai ' + nr + ' intrebari');
    }
    function calcul_punctaj(punctaj) {
        punctaj_total += punctaj;
    }
    function afis_punctaj() {
        $('#pct').text('Ai acumulat ' + parseInt(punctaj_total) + ' puncte');
    }
    function afis_info(raspuns) {
        $.ajax({
            url:"php/afis_info.php",
            method:"POST",
            data:{raspuns:raspuns},
            success:function(data){
                $('#informatii #text3').html(data);
                $('#informatii').css('display', 'block');
            }
        });
    }
    function spune_intrebare(intrebare) {
        var vorbire = new SpeechSynthesisUtterance();
        vorbire.lang = "ro-RO";
        vorbire.text = intrebare;
        window.speechSynthesis.speak(vorbire);
    }
    function afis_clasament(){
        $.ajax({
            url: `${BASE_URL}/clasament`,
            success:function(data){
                $('#clasament #text2').html(data);
            }
        });
    }
    afis_clasament();
    function vorbeste(intrebare) {
        var vorbire = new SpeechSynthesisUtterance();
        vorbire.lang = "ro-RO";
        vorbire.text = intrebare;
        window.speechSynthesis.speak(vorbire);
    }

    function actualizare_punctaj() {
        $.ajax({
            url: `${BASE_URL}/update`,
            method:"POST",
            data:{punctaj:punctaj_total},
            success:function (data) {
               // alert(data);
            }
        });
    }

    function spune_raspuns(raspuns, punctaj) {
        if('webkitSpeechRecognition' in window){
            var raspuns_vocal = new webkitSpeechRecognition();
            raspuns_vocal.lang = "ro-RO";
            raspuns_vocal.continuous = false;
            raspuns_vocal.interimResults = false;
            raspuns_vocal.start();
            var final = '';
            raspuns_vocal.onresult = function (event) {
                var it = '';
                console.log(event.results.length);

                for(var i = event.resultIndex; i < event.results.length; i++){
                    var ts = event.results[i][0].transcript;
                    ts.replace('\n', '<br>');
                    if(event.results[i].isFinal) {
                        final += ts;
                    } else {
                        it += ts;
                    }
                }
               console.log(final + ' ' + it);


                if(final + it == raspuns) {
                    vorbeste('răspuns corect');
                    calcul_punctaj(punctaj);
                    afis_punctaj();
                    console.log(exista_info);
                    if(!exista_info) {
                        afis_info(raspuns);
                    }
                } else {
                    vorbeste('răspuns greșit');
                }
                afis_nr_intrebare(--nr_intrebare);
                if(nr_intrebare == 0) {
                    $('#nr_intrebari').text('Ai terminat intrebarile');
                    $('#start').css('display', 'none');
                    actualizare_punctaj();
                    afis_clasament();
                    afis_punctaj();
                }
            };
        }
    }
    function start(){
       afis_nr_intrebare(nr_intrebare);
       afis_punctaj();
       if(actiune == 'start') {
           $.ajax({
               url: `${BASE_URL}/intrebari`,
               dataType: "json",
               success: function (data) {
                  // console.log(data);
                   intrebare = data.intrebare;
                   $("#intrebare").html(intrebare)
                   raspuns = data.raspuns;
                   //raspuns = raspuns.replace(/\u0000/gi, '');
                   punctaj = data.punctaj;
                   punctaj = parseInt(punctaj);
                  // console.log(intrebare + ' ' + raspuns);
                   //intrebare = intrebare.replace(/\u0000/gi, "");
                   if(data.info !== '') {
                       exista_info = true;
                   }
                   spune_intrebare(intrebare);
                   actiune = 'raspunde';
               }
           });
           $('#start').text('raspunde');
       } else {
          // console.log(intrebare);
          // console.log(raspuns);
           spune_raspuns(raspuns, punctaj);
           $('#start').text('start');
           actiune = 'start';
       }
    }
    $('#start').click(function () {
        start();
    });

    $('.info').click(function () {
        if ($('#info').css('margin-top') == '-500px') {
            $('#info').css('display', 'block');
            $('#info').css('margin-top', '0px');
            $('#info').css('opacity', '1');
        }
    });
    $('#closebtn').click(function () {
        if ($('#info').css('margin-top') == '0px') {
            $('#info').css('display', 'none');
            $('#info').css('margin-top', '-500px');
            $('#info').css('opacity', '0');
        }
    });
    $('#icon2').click(function () {
        if ($('#clasament').css('margin-top') == '-600px') {
            $('#clasament').css('display','block');
            $('#clasament').css('margin-top', '0px');
            $('#clasament').css('opacity', '1');
        }
    });
    $('#closebtn2').click(function () {
        if ($('#clasament').css('margin-top') == '0px') {
            $('#clasament').css('display','block');
            $('#clasament').css('margin-top', '-600px');
            $('#clasament').css('opacity', '0');
        }
    });
    $('#icon3').click(function () {
        window.location = "../";
    });
    $('#closebtn3').click(function () {
        $('#informatii').css('display', 'none');
    });
    $('.inregistrare').click(function () {
        console.log($('#nume').val());
        if($('#nume').val() == '') {
            alert('Introdu numele tau');
        } else {
            // console.log($('.nume').val());
            $.ajax({
                url:`${BASE_URL}/inregistrare`,
                method:'POST',
                data:{
                    nume:$('#nume').val()
                },
                success:function (data) {
                    if(data === '1') {
                        window.localStorage.setItem("name", $('#nume').val())
                        window.location = 'av.html';
                    }
                }
            });
        }
    });

});