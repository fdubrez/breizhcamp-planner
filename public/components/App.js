// you must get data fill with envsubst (see README.md)
const realTalks = $REAL_TALKS;
const others = $OTHER_TALKS;

const data = [...others, ...realTalks];

const formatToTagClass = {
  Université: "is-info",
  Conférence: "is-primary",
  Quicky: "is-link",
  "Tool in action": "is-warning",
  Keynote: "is-success",
  Party: "is-danger",
};

function prepareData(talks) {
  let result = {};

  talks.forEach((talk) => {
    const hourStart = talk.event_start.split("T")[1];
    if (result[hourStart]) {
      result[hourStart].push(talk);
    } else {
      result[hourStart] = [talk];
    }
  });

  return result;
}

const talkStyle = {};

const TalkCard = ({ talk, setCurrent, setModal, modal, commented }) => {
  return (
    <div
      className="column is-3 talk"
      onClick={() => {
        setCurrent(talk);
        setModal(!modal);
      }}
    >
      <div class="card">
        <span
          className="tag is-light card-venue-tag"
          style={{ fontSize: "1.5rem" }}
        >
          {talk.venue.split(" ")[1]}
        </span>
        <div class="card-content">
          <div class="media">
            <div class="media-content">
              <p class="title is-4">🧑‍🏫 {talk.name}</p>
              <p class="subtitle is-6">{talk.speakers}</p>
            </div>
          </div>
          <div class="content">
            <p class="subtitle is-6">
              <span className={`tag ${formatToTagClass[talk.format]}`}>
                {talk.format}
              </span>
              {commented[talk.id] && <span className="edited">📝</span>}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const jourParDefaut = () => {
  const now = new Date().toISOString().split("T")[0];
  switch (now) {
    case "2022-06-29":
      return "Jeudi";
    case "2022-06-30":
      return "Vendredi";
    default:
      return "Mercredi";
  }
};

const getLocalStorage = () => {
  const ls = localStorage.getItem("breizhcamp-planner");
  if (ls) {
    return JSON.parse(ls);
  }

  return {};
};

// components/App.js
function App() {
  const [current, setCurrent] = React.useState(null);
  const [modal, setModal] = React.useState(false);
  const [jourSelected, setJourSelected] = React.useState(jourParDefaut());
  const [commented, setCommented] = React.useState(getLocalStorage());
  const talks = {
    mercredi: prepareData(
      data.filter((x) => x.event_start.startsWith("2023-06-28"))
    ),
    jeudi: prepareData(
      data.filter((x) => x.event_start.startsWith("2023-06-29"))
    ),
    vendredi: prepareData(
      data.filter((x) => x.event_start.startsWith("2023-06-30"))
    ),
  };
  React.useEffect(() => {
    if (modal) {
      const existingText =
        localStorage.getItem("breizhcamp-planner") &&
        JSON.parse(localStorage.getItem("breizhcamp-planner"))[current.id]
          ? JSON.parse(localStorage.getItem("breizhcamp-planner"))[current.id]
          : "";
      document.getElementsByTagName("textarea")[0].value = existingText;
    }
  }, [current, modal, commented]);
  return (
    <div className="container">
      {modal && (
        <div className="modal is-active">
          <div class="modal-background"></div>
          <div class="modal-card">
            <header class="modal-card-head">
              <button class="delete" aria-label="close" onClick={() => {
                setModal(false)
              }} style={{
                position: "absolute",
                top: "0.8rem",
                right: "1.5rem"
              }}></button>
            </header>
            <section class="modal-card-body">
              <h3 className="title is-3">{current && `${current.name} 💬`}</h3>
              <textarea
                class="textarea"
                placeholder="Mets tes notes sur le talk ici :p"
              ></textarea>
            </section>
            <footer class="modal-card-foot">
              <button
                class="button is-info"
                onClick={() => {
                  const text =
                    document.getElementsByTagName("textarea")[0].value;
                  let actual = localStorage.getItem("breizhcamp-planner")
                    ? JSON.parse(localStorage.getItem("breizhcamp-planner"))
                    : {};
                  actual[current.id] = text;
                  localStorage.setItem(
                    "breizhcamp-planner",
                    JSON.stringify(actual)
                  );
                  let newCommented = commented
                  newCommented[current.id]
                  setCommented(newCommented)
                }}
              >
                Sauvegarder
              </button>
            </footer>
          </div>
        </div>
      )}
      <h1 className="title is-1">Breizhcamp planner 2K22</h1>
      <div className="block">
        <div class="tabs">
          <ul>
            {["Mercredi", "Jeudi", "Vendredi"].map((jour) => (
              <React.Fragment>
                <li
                  className={jourSelected === jour ? "is-active" : null}
                  onClick={() => {
                    setJourSelected(jour);
                  }}
                >
                  <a>{jour}</a>
                </li>
              </React.Fragment>
            ))}
          </ul>
        </div>
        <React.Fragment>
          {Object.entries(talks[jourSelected.toLowerCase()])
            .map(([key, values]) => {
              return {
                time: key,
                order: Number(key.replace(/:/g, "")),
                talks: values,
              };
            })
            .sort((a, b) => a.order - b.order)
            .map((x) => (
              <div class="columns">
                <div className="column is-1">
                  <h4 className="subtitle">{x.time.slice(0, 5)}</h4>
                </div>
                {x.talks.map((talk) =>
                  TalkCard({
                    talk,
                    setCurrent,
                    setModal,
                    modal,
                    commented,
                  })
                )}
              </div>
            ))}
        </React.Fragment>
      </div>
    </div>
  );
}
