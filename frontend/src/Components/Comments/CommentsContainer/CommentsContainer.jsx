import CommentPage from "../CommentPage/CommentPage";

const CommentConatiner = ({ comments }) => {
    return (
        <div>
            {comments.map((comment, index) => (
                <CommentPage key={index} comment={comment} />
            ))}
        </div>
    );
};

export default CommentConatiner;