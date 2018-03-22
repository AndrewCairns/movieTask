$( document ).ready(function() {

  if (localStorage.getItem('movieList')){
      var listContents = JSON.parse(localStorage.getItem('movieList'));
      $("ul.watchlist-container").each(function(i){
        this.innerHTML = listContents [i];
      })
  }


  $('form').submit(function (evt) { evt.preventDefault(); });
  $('form input').focus();

  var value, constructed_url;
  $('input').keyup(function() {
    if ( $(this).val().length > 2){ 
      value = $('input').val();
      constructed_url = "http://www.omdbapi.com/?apikey=8c868cbf&s=" + value;

      $.ajax({
        method : "POST",
        url: constructed_url,
        dataType : "json",
        success : function(data) {
          $('.list').html('');
            if (data.Search && data.Search.length > 1){
              data.Search.forEach(function(movie){
                if(movie.Poster != "N/A"){
                 $('.list').append(
                  '<li class="search-block">' +
                    '<div class="text-block">' + 
                      '<p class="title">' + movie.Title + '</p>' +
                      '<p class="year">' + movie.Type +', '+ movie.Year + '</p>' +
                    '</div>' +
                    '<button title="Add to watchlist" class="watchlist"> &#8594; </button>' +
                    '<img class="search-img" title="'+ movie.Title +'" src=' + movie.Poster + ' />' +
                  '</li>')
               }
            })
          }
        },
        done : function(e) {
            console.info("DONE");
        }

      })
    }
  });


  var genre_array = [];
  var unique_genres = [];

  $('.list').on('click', '.watchlist', function(){
    $(this).html("&#8856;")
    $(this).prop('disabled', true)

    var term = $(this).siblings(".search-img").attr("title");
    var overlay = $('<div class="overlay">');

    $.ajax({
      method : "POST",
      url: "http://www.omdbapi.com/?apikey=8c868cbf&t="+term,
      dataType : "json",
      success : function(movie) {
        $('.img-container ul.watchlist-container').append(
          '<li class="watchlist-list">' +
          '<div class="overlay">' +
              '<img class="search-img" title='+ movie.Title +' src=' + movie.Poster + ' />' +
              '<p class="watched" title="Watched">' + 
                  '<span>Unwatched: </span>' +
                  '<i class="fa fa-tv fa-fw"></i>' +
              '</p>' +
              '<p class="title">' + movie.Title + '</p>' +
              '<p class="year">'+ movie.Year + '</p>' +
              '<p class="genre">' + movie.Genre + '</p>' +
              '<p class="imdb-rating">IMDB rating:' + movie.imdbRating + '</p>' +
              '<div class="rating-stars text-center"> '+
                '<p>Your rating:</p>' +
                '<ul class="stars">' +
                  '<li class="star" title="Poor" data-value="1"><i class="fa fa-star fa-fw"></i></li>' +
                  '<li class="star" title="Fair" data-value="2"><i class="fa fa-star fa-fw"></i></li>' +
                  '<li class="star" title="Good" data-value="3"><i class="fa fa-star fa-fw"></i></li>' +
                  '<li class="star" title="Excellent" data-value="4"><i class="fa fa-star fa-fw"></i></li>' +
                  '<li class="star" title="WOW!!!" data-value="5"><i class="fa fa-star fa-fw"></i></li>' +
                '</ul>' +
              '</div>' +
          '</div>' +
          '</li>'
          );  
    

        //getting genres
        var movieGenre = movie.Genre.split(',');

        if(genre_array[0]){
          genre_array = genre_array[0].concat(movieGenre)
          var unique_genres = [ ...new Set(genre_array) ];
          unique_genres.sort();
        } else {
          genre_array.push(movieGenre)
          var unique_genres = [ ...new Set(genre_array[0]) ];
          unique_genres.sort();
        }





        //Populate select boxes
        $('.genre-filter').empty();
        $('.genre-filter').append($('<option>All</option>'));
        $.each(unique_genres, function(i, p) {
            $('.genre-filter').append($('<option></option>').val(p).html(p));
        });


        //update local storage
        var listContents = [];
        $("ul.watchlist-container").each(function(){
           listContents.push(this.innerHTML);
        })
        localStorage.setItem('movieList', JSON.stringify(listContents));

      },
      done : function(e) {
          console.info("DONE");
      }

    })

  })



  $('.watchlist-container').on('mouseover', '.overlay', function(){
    $(this).find('p').show();
    $(this).find('.rating-stars').show();
  });
  $('.watchlist-container').on('mouseout', '.overlay', function(){
    $(this).find('p').hide();
    $(this).find('.rating-stars').hide();
  });


  



  //genre filter
  $('.genre-filter').change(function(){
      var criteria = $(this).val();
      if(criteria == 'All'){
          console.log("criteria");
          $('.genre').parent().parent().show();
          return;
      }
      $('.genre').each(function(i,option){
          if($(this).text().indexOf(criteria) > -1){
              $(this).parent().parent().show();
          }else {
              $(this).parent().parent().hide();
          }
      });
  });






  //Star animation
  //hover
  $('.watchlist-container').on('mouseover', '.stars li', function(){
    var onStar = parseInt($(this).data('value'), 10);
   
    // Now highlight all the stars that's not after the current hovered star
    $(this).parent().children('li.star').each(function(e){
      if (e < onStar) {
        $(this).addClass('hover');
      }
      else {
        $(this).removeClass('hover');
      }
    });
    
  }).on('mouseout', '.stars li', function(){
    $(this).parent().children('li.star').each(function(e){
      $(this).removeClass('hover');
    });
  });
  
  //click  
  $('.watchlist-container').on('click', '.stars li', function(){
    var onStar = parseInt($(this).data('value'), 10);
    var stars = $(this).parent().children('li.star');
    
    for (i = 0; i < stars.length; i++) {
      $(stars[i]).removeClass('selected');
    }
    
    for (i = 0; i < onStar; i++) {
      $(stars[i]).addClass('selected');
    }
    
    
  });



  //Watched marker
  $('.watchlist-container').on('click', '.watched', function(){
    $('i', this).toggleClass("active");
    $('i', this).siblings("span").text(function(i, text){
          return text === "Watched" ? "Unwatched: " : "Watched: ";
      });
    $(this).siblings(".search-img").toggleClass("watched-hover");
  });







});