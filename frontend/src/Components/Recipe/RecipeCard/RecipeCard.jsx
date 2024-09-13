import React, { useCallback, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsUp } from "@fortawesome/free-solid-svg-icons";
import UserCard from "../../User/UserCard/UserCard";
import { useDispatch, useSelector } from "react-redux";
import {
  setIsShowingTheFullListFalse,
  setRecipes,
} from "../../../store/recipes-slice";
import { jwtDecode } from "jwt-decode";
import { addData, getAllData } from "../../../utils/apiCalls";
import CommentConatiner from "../../Comments/CommentsContainer/CommentsContainer";
import errorHandler from "../../errors/error-handler";

const RecipeCard = ({
  id,
  title,
  description,
  image,
  steps,
  ingredients,
  tags,
  userId,
}) => {
  const [likesAmount, setLikesAmount] = useState(0);
  const [showMore, setShowMore] = useState(false);
  const likes = useSelector((state) => state.likes.likes);
  const dispatch = useDispatch();
  const token = useSelector((state) => state.user.token);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState([{}]);
  const newCommentTitle = useRef();
  const newCommentDescription = useRef();

  const getComments = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/comments/byrecipe/${id}`
      );
      const data = await response.json();
      console.log(data);
      setComments(data);
    } catch (error) {
      errorHandler(error);
    }
  };

  const addComment = async () => {
    try {
      const commentDescription = newCommentDescription.current.value;
      const commentTitle = newCommentTitle.current.value;
      await addData(
        {
          title: commentTitle,
          recipeId: id,
          userId: jwtDecode(token).id,
          description: commentDescription,
        },
        "comments"
      );
      newCommentTitle.current.value = "";
      newCommentDescription.current.value = "";
      getComments();
    } catch (error) {
      errorHandler(error);
    }
  };

  const checkIfLiked = useCallback(() => {
    if (likes.length === 0) {
      setIsLiked(false);
      return;
    }
    const liked = likes.some((like) => like.recipeId === id);
    liked ? setIsLiked(true) : setIsLiked(false);
  }, [likes, id]);

  const loadRecipesByTag = async (tagName) => {
    const response = await fetch(
      `http://localhost:3001/recipes/bytag/${tagName}`
    );
    const data = await response.json();
    dispatch(setRecipes(data));
    dispatch(setIsShowingTheFullListFalse());
  };

  const toggleShowMore = async () => {
    await getComments();
    setShowMore(!showMore);
  };

  const getLikes = useCallback(() => {
    fetch(`http://localhost:3001/likes/byrecipe/${id}`)
      .then((response) => response.json())
      .then((data) => setLikesAmount(data.length))
      .catch((error) => {
        alert(error.message);
      });
  }, [id]);

  const addLike = (recipeId) => {
    let like = {
      userId: jwtDecode(token).id,
      recipeId: recipeId,
    };
    fetch("http://localhost:3001/likes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(like),
    })
      .then((response) => response.json())
      .then((data) => {
        setLikesAmount((prevLikes) =>
          data.message.includes("added") ? prevLikes + 1 : prevLikes - 1
        );
        setIsLiked(data.message.includes("added") ? true : false);
      })
      .catch((error) => {
        alert(error.message);
      });
  };

  useEffect(() => {
    getLikes();
    checkIfLiked();
  }, [getLikes, checkIfLiked]);

  return (
    <div className="recipe-card bg-gray-100 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-primary">{title}</h2>
      <p className="mb-4">{description}</p>
      <div className="flex justify-center mb-4">
        <img src={image} className="w-40 h-40" alt={title} />
      </div>
      <div className="mb-4">
        <h4 className="font-semibold">Ingredients:</h4>
        <ul className="list-none">
          {ingredients.map((ingredient, index) => (
            <li key={index}>{ingredient.name}</li>
          ))}
        </ul>
      </div>
      {showMore && (
        <div className="show-more mb-4">
          <div className="text-center mb-4">
            <h4 className="font-semibold">Steps:</h4>
            <p>{steps}</p>
          </div>
          <div>
            <h4 className="font-semibold">Tags:</h4>
            {tags.map((tag, index) => (
              <span key={index}>
                <button
                  onClick={() => loadRecipesByTag(tag.name)}
                  className="mr-2 mb-2 py-1 px-3 bg-primary text-white rounded-md"
                >
                  {tag.name}
                </button>
              </span>
            ))}
          </div>
          <div className="flex justify-center">
            <UserCard id={userId} />
          </div>
          <div className="new-comment-form mb-4">
    <h4 className="text-lg font-semibold mb-2">Add a Comment:</h4>

    <label htmlFor="title-comment" className="block font-medium mb-1">
      Title:
    </label>
    <input
    ref={newCommentTitle}
    id="title-comment"
    className="w-full border-2 border-gray-300 rounded-md p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-purple-100 transition"
    placeholder="Enter a title for your comment"
  />

    <label htmlFor="comment" className="block font-medium mb-1">
      Description:
    </label>
    <textarea
    ref={newCommentDescription}
    id="comment"
    className="w-full h-28 border-2 border-gray-300  rounded-md p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-primary  focus:bg-purple-100 transition resize-none"
    placeholder="Write your comment here"
  />

    <button
      onClick={addComment}
      className="button bg-primary text-white font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out hover:bg-accent1 w-full"
    >
      Add Comment
    </button>
  </div>
          <div className="comments-list max-h-60 overflow-y-auto mb-6 p-4 border border-gray-300 rounded-md">
    {comments.length === 0 ? (
      <p className="text-center text-gray-500">No comments yet. Be the first to comment!</p>
    ) : (
      comments.map((comment, index) => (
        <div key={index} className="comment bg-gray-100 p-4 rounded-md shadow-md mb-4">
          <h4 className="font-semibold text-primary">{comment.title}</h4>
          <p className="text-gray-700">{comment.description}</p>
        </div>
      ))
    )}
  </div>
        </div>
      )}
      <div className="flex items-center justify-center mb-4">
        <div className="cursor-pointer transform scale-125 mr-2">
          <FontAwesomeIcon
            icon={faThumbsUp}
            onClick={() => addLike(id)}
            className={isLiked ? "text-primary" : "text-gray-400"}
          />
        </div>
        <p className="text-lg font-semibold">{likesAmount}</p>
      </div>
      <div>{/* <CommentConatiner comments={comments} /> */}</div>

      <button
        className="button bg-primary text-white font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out hover:bg-accent1"
        onClick={toggleShowMore}
      >
        {showMore ? "Show Less" : "Show More"}
      </button>
    </div>
  );
};

export default RecipeCard;
