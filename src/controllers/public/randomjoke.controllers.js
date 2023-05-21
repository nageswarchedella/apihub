import randomJokesJson from "../../json/randomjoke.json" assert { type: "json" };
import { filterObjectKeys } from "../../utils/index.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const getRandomJokes = asyncHandler(async (req, res) => {
  const page = +(req.query.page || 1);
  const limit = +(req.query.limit || 10);
  const query = req.query.query?.toLowerCase(); // search query
  const inc = req.query.inc?.split(","); // only include fields mentioned in this query

  const allJokes = randomJokesJson;

  const startPosition = +(page - 1) * limit;

  let randomJokesArray = (
    query
      ? [...randomJokesJson].filter((joke) => {
          return joke.content.toLowerCase().includes(query);
        })
      : [...randomJokesJson]
  ).slice(startPosition, startPosition + limit);

  if (inc && inc[0]?.trim()) {
    randomJokesArray = filterObjectKeys(inc, randomJokesArray);
  }

  const payload = {
    previousPage:
      page > 1
        ? `${req.protocol + "://" + req.get("host") + req.baseUrl}?page=${
            page - 1
          }&limit=${limit}&query=${query}`
        : null,
    currentPage: `${req.protocol + "://" + req.get("host") + req.originalUrl}`,
    nextPage:
      randomJokesArray.length === limit &&
      [...randomJokesArray].pop()?.id < allJokes.length
        ? `${req.protocol + "://" + req.get("host") + req.baseUrl}?page=${
            page + 1
          }&limit=${limit}`
        : null,
    jokes: randomJokesArray,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, payload, "Random jokes fetched successfully"));
});

const getJokeById = asyncHandler(async (req, res) => {
  const { jokeId } = req.params;
  const joke = randomJokesJson.find((joke) => +joke.id === +jokeId);
  if (!joke) {
    throw new ApiError(404, "Joke does not exist.");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, joke, "Joke fetched successfully"));
});

const getARandomJoke = asyncHandler(async (req, res) => {
  const randomJokesArray = randomJokesJson;
  const randomIndex = Math.floor(Math.random() * randomJokesArray.length);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        randomJokesArray[randomIndex],
        "Random joke fetched successfully"
      )
    );
});

export { getRandomJokes, getARandomJoke, getJokeById };
