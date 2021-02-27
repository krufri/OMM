import React, { useState, useEffect, useRef } from "react";
import {
  Grid,
  Button,
  Container,
  IconButton,
  Typography,
  TextField,
  Box,
  makeStyles,
  Select,
  FormControl,
  InputLabel,
  Modal,
  FormControlLabel,
  Checkbox,
  Snackbar,
  Card,
  CardMedia,
} from "@material-ui/core";
import { Video } from "react-video-stream";

import { ToggleButton, Alert } from "@material-ui/lab";

import {
  Hearing,
  PlayArrow,
  Pause,
  Shuffle,
  Close,
  Tune,
  ArrowDownward,
  ArrowUpward,
  ChevronLeft,
  ChevronRight,
} from "@material-ui/icons";


import { Chart } from "react-google-charts";



import Moment from "moment";

import AuthService from "../../services/auth.service";
import Filter from "./Filter";
import MemeView from "./MemeView";
import "./../../css/Overview/singleView.css";

//create Styles
function getModalStyle() {
  const top = 50;
  const left = 50;
  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  spacing: {
    marginTop: theme.spacing(2),
    marginRight: theme.spacing(2),
  },
  formControl: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(2),
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  paper: {
    position: "absolute",
    width: `${50}%`,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  numberField: {
    width: `${15}%`,
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(2),
  },
  filterButton: {
    height: `${70}%`,
    marginTop: theme.spacing(2),
    marginRight: theme.spacing(2),
  },
  commentField: {
    minWidth: `${90}%`,
    marginTop: theme.spacing(2),
    marginRight: theme.spacing(2),
  },
  publishButton: {
    marginTop: `${1}%`,
    marginRight: `${10}%`,
  },
  commentBox: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(2),
    minWidth: `${80}%`,
    backgroundColor: theme.palette.background.paper,
    padding: `${2}%`,
    borderColor: theme.palette.primary.main,
  },
}));

/*
This method sets the interval for the Slideshow
*/
function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    let id = setInterval(() => {
      savedCallback.current();
    }, delay);
    return () => clearInterval(id);
  }, [delay]);
}

const SingleView = () => {
  const [memes, setMemes] = useState([
    {
      caption: Array(0),
      tags: Array(0),
      _id: "5fdf7a7a65f604350c20b629",
      upper: "Uploading the group task before deadline",
      lower: "Uni2work NOT working",
    },
  ]);
  const [currentMemeIndex, setCurrentMemeIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRandom, setIsRandom] = useState(false);
  const [comment, setComment] = useState("");

  const [originalMemes, setOriginalMemes] = useState([
    {
      caption: Array(0),
      tags: Array(0),
      _id: "5fdf7a7a65f604350c20b629",
      upper: "Uploading the group task before deadline",
      lower: "Uni2work NOT working",
    },
  ]);

  const [sortOpt, setSortOpt] = useState(null);
  const [sortDown, setSortDown] = useState(false);

  

  const [open, setOpen] = useState(false);
  const [openSnack, setOpenSnack] = useState(false);

  const [moreModuleOpen, setMoreModuleOpen] = useState(false);
  const [modalStyle] = useState(getModalStyle);

  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState(null);

  const videoTag = useRef(null);
  
  const canvasRef = useRef(null);
  const [canvasWidth, setCanvasWidth] = useState(350);
    const [canvasHeight, setCanvasHeight] = useState(250);
    let canvasRecorder = null;
    const [imgPaths, setImgPaths] = [];


  let likeDf = [];
  const [chartData, setChartData] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);

  const classes = useStyles();

  const [isAccessible, setIsAccessible] = useState(false);


 

  /* 
    Modal
    handels opening and closing of the filter Modal.
    When opend it sets the filtered Memelist to the originalMemes from the database.
    */
  const handleOpen = () => {
    setMemes(originalMemes);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  /*
  getDaysOffMonths returns a list of dates from the actual to 2 months back.
  */
  const getDaysOfMonth = () => {
    const today = new Date (Date.now());
    let dateThreeMonths = new Date(today);
    dateThreeMonths.setMonth(dateThreeMonths.getMonth() - 2);
    let dateArray = [];
    let currentDate = dateThreeMonths;
    while (currentDate <= today) {
        dateArray.push(new Date (currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dateArray;
  }

  /* 
    Modal
    handels opening and closing of the filter Modal.
    When opend it sets the filtered Memelist to the originalMemes from the database.
    */
  const handleMoreModuleOpen = () => {
    getUpdatedMemes();
    const datesArray = getDaysOfMonth();
    let likeList = memes[currentMemeIndex].listlikes;
    let dislikeList = memes[currentMemeIndex].dislikes;
  
    datesArray.forEach(date =>{
      const dateDate = new Date(date);
      let likeCount=0;
      let dislikeCount=0;

      likeList.forEach(like => {
      const likeDate = new Date(like.date);
      likeCount = (likeDate.setHours(0,0,0,0) === dateDate.setHours(0,0,0,0))? likeCount+1 : likeCount;
      })

      dislikeList.forEach(dislike => {
        const dislikeDate = new Date(dislike.date);
        dislikeCount = (dislikeDate.setHours(0,0,0,0) === dateDate.setHours(0,0,0,0))? dislikeCount+1 : dislikeCount;
        })
        likeDf.push({"date": dateDate, "likeCount": likeCount, "dislikeCount" : dislikeCount});
    })

    const columns = [
      { type: 'date', label: 'date' },
      { type: 'number', label: 'likeCount' },
      { type: 'number', label: 'dislikeCount' },
    ]
    let rows = []
    const nonNullData = likeDf.filter(row => row.likeCount !== null)
    for (let row of nonNullData) {
      const { date, likeCount, dislikeCount } = row
      rows.push([new Date(Date.parse(date)), likeCount, dislikeCount])
    }
    console.log(rows);
    setDataLoading(true);
    setChartData([columns, ...rows]);
    
    setMoreModuleOpen(true);
  };

  const handleMoreModuleClose = () => {
    setMoreModuleOpen(false);
  };

 
  /*
    SnackBar
    handles opening and closing of the snackbar that informs the user when no memes are available by the filter criteria.
    */
  const handleOpenSnack = () => {
    setOpenSnack(true);
  };

  const handleCloseSnack = () => {
    setOpenSnack(false);
  };

  // Sort
  /*
   The method handleSortOptChange is called when the user changes the value.
   It then calls the method which sorts the memes based on the selected value.
   */
  const handleSortOptChange = (event) => {
    setSortOpt(event.target.value);
    if (event.target.value === "votes") {
      sortMemesByVote();
    } else if (event.target.value === "creationDate") {
      sortMemesByDate();
    }
  };

  /*
    The method handleClickSortDirection is called when the user clicks the arrow button in order to change the direction of the sorted memes (e.g. many to few).
    It then calls the method which sorts the memes based on the value in the select menu.
    */
  const handleClickSortDirection = () => {
    setSortDown(!sortDown);
    if (sortOpt === "votes") {
      sortMemesByVote();
    } else if (sortOpt === "creationDate") {
      sortMemesByDate();
    }
  };

  /*
    The method sortMemesByVote is called when the user changes the Sort by value or the direction.
    It take the direction and by that arranges the memelist by that direction and vote.
    It sets the currentMemeIndex to the first meme of the new arranged list.
    */
  const sortMemesByVote = () => {
    if (!sortDown) {
      memes.sort(
        (memeA, memeB) =>
          memeA.listlikes.length -
          memeA.dislikes.length -
          (memeB.listlikes.length - memeB.dislikes.length)
      );
    } else {
      memes.sort(
        (memeA, memeB) =>
          memeB.listlikes.length -
          memeB.dislikes.length -
          (memeA.listlikes.length - memeA.dislikes.length)
      );
    }
    setCurrentMemeIndex(0);
  };

  /*
    The method sortMemesByDate is called when the user changes the Sort by value or the direction.
    It take the direction and by that arranges the memelist by that direction and date.
    It sets the currentMemeIndex to the first meme of the new arranged list.
    */
  const sortMemesByDate = () => {
    if (!sortDown) {
      memes.sort(
        (memeA, memeB) =>
          Moment(memeA.creationDate) - Moment(memeB.creationDate)
      );
    } else {
      memes.sort(
        (memeA, memeB) =>
          Moment(memeB.creationDate) - Moment(memeA.creationDate)
      );
    }
    setCurrentMemeIndex(0);
  };

  
  /* Search*/
  /*
    The method handleChange is called when the textfield value of the searchbar changes.
    It takes the writtem text and checks if it is included in the title of the memes.
    It updates Memes by the filltered list and sets the index to the first image.
    When no meme fulfills the filter criteria the snackbar with a warning is opened and the memes is not updated.
    */
  const handleChange = () => (event) => {
    let filteredList = originalMemes;

    if (event.target.value !== "") {
      filteredList = originalMemes.filter((meme) => {
        return meme.title
          .toLowerCase()
          .includes(event.target.value.toLowerCase());
      });
    }
    if (filteredList.length === 0) {
      handleOpenSnack();
      console.log("no memes");
      return;
    }
    setMemes(filteredList);
    setCurrentMemeIndex(0);
  };

  /* Slideshow */
  /*
    The method randomize is called when the usere clicks to the next meme and random is selected.
    It takes a random number limited by the number of memes.
    It changed the memeindex but checks that it is not the same image as before.
    */
  function randomize() {
    let randomIndex = Math.floor(Math.random() * memes.length);
    if (randomIndex !== currentMemeIndex) {
      setCurrentMemeIndex(randomIndex);
    } else {
      randomize();
    }
  }

  /*
    The method nextMeme will show the next meme.
    It is called when the usere clicks the Arrow Button to the right or autoplay is on.
    It takes the current Meme index and calls random when the random button is selected.
    Otherwise it increases the memeindex and starts with the first meme when it is on the end.
    */
  async function nextMeme() {
    let current = currentMemeIndex;
    if (memes.length > 1) {
      if (isRandom) {
        randomize();
      } else {
        current =
          currentMemeIndex === memes.length - 1 ? 0 : currentMemeIndex + 1;
        setCurrentMemeIndex(current);
      }
    }
  }

  /*
  The method nextMeme will show the previous meme.
  It is called when the usere clicks the Arrow Button to the left.
  Otherwise it decreases the memeindex and starts with the first meme when it is on the end.
  */
  function previousMeme() {
    let current = currentMemeIndex;
    if (memes.length > 1) {
      current =
        currentMemeIndex === 0 ? memes.length - 1 : currentMemeIndex - 1;
      setCurrentMemeIndex(current);
    }
  }

  /*
    Comments
    */
  /*
     The method handleCommentClick will call addComment when the comment is not empty.
     */
  const handleCommentClick = () => {
    if (comment !== "") {
      addComment();
      getUpdatedMemes();
    }
  };

  /*
    The method addComment pushes the new comment to the server.
    */
  async function addComment() {
    setComment("");
    const currentMemeId = memes[currentMemeIndex]._id;
    await fetch("http://localhost:3030/memeIO/add-comment", {
      method: "POST",
      mode: "cors",
      headers: AuthService.getTokenHeader(),
      body: JSON.stringify({
        id: currentMemeId,
        date: Date.now(),
        commenttext: comment,
      }),
    }).then((response) => {
      console.log(response);
    });
  }

  /*
    The method handleDeleteCommentClick calls removeComment when the user clicks x button on his/her comment.
    */
  const handleDeleteCommentClick = (comment) => {
    console.log("delete comment");
    removeComment(comment);
    getUpdatedMemes();
  };

  /*
   The method removeComment pulls the comment by the user from the server.
   */
  async function removeComment(comment) {
    const currentMemeId = memes[currentMemeIndex]._id;
    await fetch("http://localhost:3030/memeIO/remove-comment", {
      method: "POST",
      mode: "cors",
      headers: AuthService.getTokenHeader(),
      body: JSON.stringify({
        id: currentMemeId,
        commenttext: comment.commenttext,
      }),
    }).then((response) => {
      console.log(response);
    });
  }

  /*
   The method loadMemes gets all public memes from the server.
   It takes the index of the selected meme and therefore changes the currentMemeIndex to show at the beginning the right meme.
   */
  const loadMemes = async () => {
    await fetch("http://localhost:3030/memeIO/get-public-memes").then((res) => {
      res.json().then((json) => {
        setMemes(json.docs);
        setOriginalMemes(json.docs);

        const url = window.location.pathname;
        const memeId = url.substring(url.lastIndexOf("/") + 1);
        const curMeme = json.docs.find((element) => element._id === memeId);

        const ind = json.docs.indexOf(curMeme);

        setCurrentMemeIndex(ind);
        return json;
      });
    });
  };

  /*
   The method loadMemes gets all public memes from the server.
   It does not change the index.
   */
  const getUpdatedMemes = async () => {
    console.log("update Parent");
    await fetch("http://localhost:3030/memeIO/get-public-memes").then((res) => {
      res.json().then((json) => {
        setMemes(json.docs);
        return json;
      });
    });
  };


  const requestRef = React.useRef();
  let ind = 0;

  const getPixelRatio = context => {
      var backingStore =
      context.backingStorePixelRatio ||
      context.webkitBackingStorePixelRatio ||
      context.mozBackingStorePixelRatio ||
      context.msBackingStorePixelRatio ||
      context.oBackingStorePixelRatio ||
      context.backingStorePixelRatio ||
        1;
        
        return (window.devicePixelRatio || 1) / backingStore;
    };
  /*
  The tick loadMemes changes the image in the canvas every 2 seconds.
  */
  const tick = () => {
    const memeList = memes;
    
    let img = new Image();
  
    const checkVideoState = setInterval(() => {


      img.src = memeList[ind].url;

      if (img.src) {
        clearInterval(checkVideoState);
        const canvas = canvasRef.current;
        if (canvas) {
          setIsVideoLoading(false);

        let context = canvas.getContext('2d');
        let ratio = getPixelRatio(canvas);

        let width = getComputedStyle(canvas)
            .getPropertyValue('width')
            .slice(0, -2);
        let height = getComputedStyle(canvas)
            .getPropertyValue('height')
            .slice(0, -2);
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        context.drawImage(
            img,
            0,
            0,
            canvas.width,
            canvas.height
          );
        }

        if (memeList.length > 1) {
          
          ind = (ind === memeList.length - 1) ? 0 : ind + 1;
          console.log(ind);
        }
        requestAnimationFrame(tick);
      }
    }, 2000);
  };

  /*
      The  useEffect is called at the beginning of the mounted component.
      It loads the memes of the server and starts the animation video.
      */
  useEffect(() => {
    loadMemes();
    
    requestRef.current = requestAnimationFrame(tick);
    
    return () => cancelAnimationFrame(requestRef);
  }, []);

  

  /*
   The method useInterval checks if autoplay is selected.
   It increases the new memeindex or calls randomize method whe it is selected.
   */
  useInterval(() => {
    if (isPlaying) {
      let current = currentMemeIndex;
      if (memes.length > 1) {
        if (isRandom) {
          randomize();
        } else {
          current =
            currentMemeIndex === 0 ? memes.length - 1 : currentMemeIndex - 1;
          setCurrentMemeIndex(current);
        }
      }
    }
  }, 5000);

  //Meme Component
  const SingleMeme = () => {
    return (
      (memes[currentMemeIndex].publicOpt=="public")?
      <MemeView
        memeInfo={memes[currentMemeIndex]}
        isAccessible={isAccessible}
        getUpdatedMemes={getUpdatedMemes}
      />
      : null
    );
  };

  //Comments Component
  const ListComments = ({ currentMeme }) => {
    return (
      <Grid container spacing={1}>
        {currentMeme.hasOwnProperty("comments")
          ? currentMeme.comments.map((comment) => (
            <div
              className={classes.spacing}
              key={comment._id}
              style={{ width: "90%" }}
            >
              <Box
                border={1}
                className={classes.commentBox}
                borderRadius="borderRadius"
              >
                <Grid container spacing={2}>
                  <Grid item xs={9}>
                    <Typography variant="body2">
                      Comment from{" "}
                      {comment.hasOwnProperty("user")
                        ? comment.user
                        : "Anonymous"}{" "}
                        on the{" "}
                      {comment.hasOwnProperty("date")
                        ? Moment(comment.date).format("MMM Do YY")
                        : "No date"}
                        :
                      </Typography>
                    <Typography variant="body1" className={classes.spacing}>
                      {comment.hasOwnProperty("commenttext")
                        ? comment.commenttext
                        : "No text"}
                    </Typography>
                  </Grid>

                  {comment.user == localStorage.user ? (
                    <Grid item xs container justify="flex-end">
                      <IconButton
                        onClick={() => handleDeleteCommentClick(comment)}
                        variant="contained"
                        edge="end"
                      >
                        <Close />
                      </IconButton>
                    </Grid>
                  ) : null}
                </Grid>
              </Box>
            </div>
          ))
          : null}
      </Grid>
    );
  };

  return (
    <Container className="memeScrollListContainer">
      <Grid container spacing={3}>
        <Grid item xs>
          <ToggleButton
            className={classes.spacing}
            value="check"
            selected={isPlaying}
            onChange={() => {
              setIsPlaying(!isPlaying);
            }}
          >
            {" "}
            {isPlaying ? <Pause /> : <PlayArrow />}
            {isPlaying ? "Pause" : "Play"}
          </ToggleButton>

          <ToggleButton
            className={classes.spacing}
            value="check"
            selected={isRandom}
            onChange={() => {
              setIsRandom(!isRandom);
            }}
          >
            <Shuffle /> Random{" "}
          </ToggleButton>
          <ToggleButton
            className={classes.spacing}
            value="check"
            selected={isAccessible}
            onClick={() => setIsAccessible(!isAccessible)}
          >
            {" "}
            <Hearing />
          </ToggleButton>
        </Grid>
        <Grid item xs={4}>
          <div className="search-container">
            <form>
              <TextField
                className="SearchTextField"
                id="search"
                label="Search Meme"
                placeholder="Search Meme"
                fullWidth
                margin="normal"
                variant="outlined"
                onChange={handleChange()}
              />
            </form>
          </div>
        </Grid>

        <Grid item xs>
          <Button
            onClick={handleOpen}
            className={classes.filterButton}
            variant="outlined"
            edge="end"
            size="medium"
            startIcon={<Tune />}
          >
            Filter
          </Button>
          <Filter 
           open={open}
           handleFilterClose={handleClose}
           memes= {memes}
           setMemes={setMemes}
           handleOpenSnack={handleOpenSnack}
           setCurrentMemeIndex={setCurrentMemeIndex}
           />
        
          <Snackbar
            open={openSnack}
            autoHideDuration={6000}
            onClose={handleCloseSnack}
          >
            <Alert onClose={handleCloseSnack} severity="error">
              No memes
            </Alert>
          </Snackbar>

          <FormControl variant="outlined" className={classes.spacing}>
            <InputLabel htmlFor="outlined-format-native-simple">
              Sort by
            </InputLabel>
            <Select
              native
              label="Sort by"
              id="select-Sort-Option"
              value={sortOpt}
              onChange={handleSortOptChange}
            >
              <option value={"none"}>None</option>
              <option value={"votes"}>Votes</option>
              <option value={"creationDate"}>Creation Date</option>
            </Select>
          </FormControl>

          <ToggleButton
            className={classes.filterButton}
            value="check"
            onChange={() => {
              handleClickSortDirection();
            }}
          >
            {" "}
            {sortDown ? <ArrowUpward /> : <ArrowDownward />}
          </ToggleButton>
        </Grid>
      </Grid>

      <Grid container className={classes.spacing} spacing={3}>
        <Grid item xs={1}>
          <IconButton
            className="arrows"
            onClick={previousMeme}
            aria-label="previous"
          >
            <ChevronLeft fontSize="large" />
          </IconButton>
        </Grid>
        <Grid item xs={8}>
          <SingleMeme listmemes={memes} />
        </Grid>
        <Grid item xs={1}>
          <IconButton className="arrows" onClick={nextMeme} aria-label="next">
            <ChevronRight fontSize="large" />
          </IconButton>
        </Grid>
        <Grid item xs >

          <Button
            className="classes.buttonStyle selection"
            onClick={handleMoreModuleOpen}
            variant="contained"
            color="secondary"
          >
            More infos
          </Button>
          <Modal
            open={moreModuleOpen}
            onClose={handleMoreModuleClose}
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
          >
            <div style={modalStyle} className={classes.paper}>
              <Typography variant="h5">Graph</Typography>
              <Grid>
                <Chart
                  width={"500px"}
                  height={"300px"}
                  chartType="PieChart"
                  loader={<div>Loading Chart</div>}
                  data={[
                    ["Likes and Dislikes", "Number"],
                    [
                      "Likes",
                      memes[currentMemeIndex].hasOwnProperty("listlikes")
                        ? memes[currentMemeIndex].listlikes.length
                        : 0,
                    ],
                    [
                      "Dislikes",
                      memes[currentMemeIndex].hasOwnProperty("dislikes")
                        ? memes[currentMemeIndex].dislikes.length
                        : 0,
                    ],
                  ]}
                  options={{
                    title: "Distribution of likes",
                  }}
                  rootProps={{ "data-testid": "1" }}
                />
             
               {dataLoading? (
                 <Chart
                 chartType="LineChart"
                 data={chartData}
                 options={{
                   hAxis: {
                    format: 'd MMM',
                   },
                   vAxis: {
                     format: 'short',
                   },
                   title: 'Likes and dislikes over time.',
                 }}
                 rootProps={{ 'data-testid': '3' }}
               />
               ):(
               <div>Fetching data from API</div>
               )}
                 
              </Grid>
            </div>
          </Modal>


        </Grid>
      </Grid>

      <Grid container className={classes.spacing} spacing={3}>
        <Grid item xs={1}></Grid>
        <Grid container direction="column" item xs={8}>
          <Grid item xs>
            <Typography className={classes.spacing} variant="body1">
              Comments:
            </Typography>
          </Grid>

          <Grid item xs>
            <TextField
              className={classes.commentField}
              id="outlined-multiline-static"
              label="Add comment"
              multiline
              rows={3}
              variant="outlined"
              onChange={(event) => setComment(event.target.value)}
              value={comment}
            />
            <Grid item xs container justify="flex-end">
              <Button
                className={classes.publishButton}
                variant="contained"
                color="secondary"
                disabled={!memes[currentMemeIndex]}
                onClick={handleCommentClick}
              >
                Publish
              </Button>
            </Grid>
          </Grid>
          <ListComments
            className={classes.spacing}
            currentMeme={memes[currentMemeIndex]}
          />
        </Grid>
        <Grid item xs={1}></Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={1}></Grid>
        <Grid container item xs={8}>

          <Grid item xs>
          
            <div>
           

              {!isVideoLoading && <canvas ref={canvasRef} style={{ width: '400px', height: '400px' }}/>}

              {isVideoLoading && (
                <p>Please wait while we load the video stream.</p>
              )}
            </div>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SingleView;
