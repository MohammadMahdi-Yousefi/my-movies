import { useEffect, useState } from "react";
import "./index.css";
import StarRating from "./StarERating";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "c6d6758";

export default function App_v1() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setselectedId] = useState(null);

  
  useEffect(() => {
    const controller = new AbortController();
    async function fetchMovies() {
      try {
        setIsLoading(true);
        setError("");
        // const res = await fetch(
        //   `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
        //   { signal: controller.signal }
        // );
        const res = await fetch(
          `https://www.omdbapi.com/?apikey=c6d6758&s=${query}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error("faild to fetch data");

        const data = await res.json();

        if (data.Response === "False") throw new Error("Movie not found");
        setMovies(data.Search);
        setError("");
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    if (query.length < 2) {
      setMovies([]);
      setError("");
      return;
    }
    handleCLoseBtn();
    fetchMovies();
    return function () {
      controller.abort();
    };
  }, [query]);
  // checking the selected id that user choosed
  function handleSelectId(id) {
    setselectedId((selectedId) => (selectedId === id ? null : id));
  }
  // close seletion movie menu
  function handleCLoseBtn() {
    setselectedId(null);
  }
  // add watch movie handler
  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
  }
  // delete watch movie handler
  function handleDeleteWatchedMovie(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }
  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>

      <Main>
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList>
              {movies?.map((movie) => (
                <Movie
                  movie={movie}
                  key={movie.imdbID}
                  onSelectedId={handleSelectId}
                />
              ))}
            </MovieList>
          )}
          {error && <ErrorMessage messages={error} />}
        </Box>

        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onCloseBtn={handleCLoseBtn}
              onAddWatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList
                watched={watched}
                onDeletWatch={handleDeleteWatchedMovie}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function ErrorMessage({ messages }) {
  return (
    <p className="error">
      <span>⛔</span>
      {messages}
    </p>
  );
}
function Loader() {
  return (
    <>
      <p className="loader"> loading..</p>
    </>
  );
}
function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>

      {isOpen && children}
    </div>
  );
}

function MovieList({ children }) {
  return <ul className="list list-movies">{children}</ul>;
}

function Movie({ movie, onSelectedId }) {
  return (
    <li onClick={() => onSelectedId(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function MovieDetails({ selectedId, onCloseBtn, onAddWatched, watched }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [userRating, setUserRating] = useState("");
  const [movie, setMovie] = useState({});
  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Genre: genre,
    Director: director,
  } = movie;
  // checking there is no dublicated whatched movie in list
  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
  // getting uers rating for wahtched movie in list
  const watchedMovieRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;

  // fetching  watched movie detail by id
  useEffect(() => {
    async function getMovieDetails() {
      try {
        setIsLoading(true);
        setError("");
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
        );
        if (!res.ok) throw new Error("faild to fetch data");
        const data = await res.json();
        if (data.Response === "False") throw new Error("Movie not founded");
        setMovie(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    getMovieDetails();
  }, [selectedId]);

  // adding new movie watched
  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      imdbRating: +imdbRating,
      poster,
      year,
      title,
      runtime: +runtime.split(" ").at(0),
      userRating,
    };
    onAddWatched(newWatchedMovie);
    onCloseBtn();
  }
  // change title of page
  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;
      // clenup function to remove side effect of title
      return function () {
        document.title = "UsePopCorn";
      };
    },
    [title]
  );
  // closing whatched list by clicking escape btn
  useEffect(() => {
    function calBack(e) {
      if (e.code === "Escape") {
        onCloseBtn();
        console.log("closing");
      }
    }
    document.addEventListener("keydown", calBack);
    return function () {
      document.removeEventListener("keydown", calBack);
    };
  }, [onCloseBtn]);
  return (
    <>
      {isLoading && <Loader />}
      <div className="details">
        {!isLoading && !error && (
          <>
            <header>
              <button className="btn-back" onClick={onCloseBtn}>
                &larr;
              </button>
              <img src={poster} alt={`poster of mo ie ${movie}`} />
              <div className="details-overview">
                <h2>{title}</h2>
                <p>
                  {released} &bull; {runtime}
                </p>
                <p>{genre}</p>
                <p>
                  <span>⭐</span>
                  {imdbRating} IMDB Rating
                </p>
              </div>
            </header>
            <section>
              <div className="rating">
                {!isWatched ? (
                  <>
                    <StarRating
                      maxRating={10}
                      size={24}
                      onSetRating={setUserRating}
                    />
                    {userRating > 0 && (
                      <button className="btn-add" onClick={handleAdd}>
                        + Add to list
                      </button>
                    )}
                  </>
                ) : (
                  <p>
                    You rated this Movie{" "}
                    <span className="watchedUerRating">
                      {watchedMovieRating}
                    </span>
                  </p>
                )}
              </div>
              <p>
                <em>{plot}</em>
              </p>
              <p>Starrring{actors}</p>
              <p>directed by {director}</p>
            </section>
          </>
        )}
      </div>
      {error && <ErrorMessage messages={error} />}
    </>
  );
}
function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMoviesList({ watched, onDeletWatch }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          onDeletWatch={onDeletWatch}
          movie={movie}
          key={movie.imdbID}
        />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, onDeletWatch }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => onDeletWatch(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}
