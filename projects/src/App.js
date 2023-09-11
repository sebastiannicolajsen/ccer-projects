import "./App.css";
import DataTable from "react-data-table-component";
import Modal from "react-modal";
import data from "./data/projects.json";
import React from "react";
import tinycolor from "tinycolor2";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { MultiSelect} from "react-multi-select-component"

const projects = data.projects.map((p) => {
  p.responsibles = p.responsibles.map((r) =>
    data.people.find((p) => p.email === r)
  );
  p.tags = p.tags.map((t) => data.tags.find((tag) => tag.name === t));
  return p;
});

const preformat = (str) => str?.toLowerCase().trim();

const flstReduction = (f, lst, str) => {
  return lst
    ? lst.reduce((acc, ele) => acc || f(ele).toLowerCase().includes(str), false)
    : false;
};

const allowedSearches = ["title", "tags", "supervisors", "contents"];

const dropdownOptions = allowedSearches.map((id) => ({ value: id, label: id }));

const searchAllowed = (group, type, f) => (group.includes(type) ? f() : false);

const searchProject = (group, str, p) => {
  str = preformat(str);
  return (
    searchAllowed(group, "title", () => preformat(p.title)?.includes(str)) ||
    searchAllowed(group, "contents", () =>
      preformat(p.abstract).includes(str)
    ) ||
    searchAllowed(group, "contents", () =>
      preformat(p.expected_competencies).includes(str)
    ) ||
    searchAllowed(group, "contents", () =>
      preformat(p.education_background).includes(str)
    ) ||
    searchAllowed(group, "contents", () =>
      preformat(p.outcome).includes(str)
    ) ||
    searchAllowed(group, "tags", () =>
      flstReduction((t) => t.name, p.tags, str)
    ) ||
    searchAllowed(group, "supervisors", () =>
      flstReduction((t) => t.email + " " + t.name, p.responsibles, str)
    )
  );
};

const Pill = ({ text, color }) => (
  <span
    style={{
      backgroundColor: color,
      borderRadius: 25,
      padding: 5,
      margin: 2,
      color: tinycolor(color).isDark() ? "white" : "black",
    }}
  >
    {" "}
    {text}
  </span>
);

const Supervisor = ({ t }) => (
  <span>
    {t.name} (
    <a
      href={`mailto:${t.email}`}
      style={{ textDecoration: "none", color: "gray" }}
    >
      {t.email}
    </a>
    )
  </span>
);

// Modal.setAppElement("#main")

function App() {
  const [modalIsOpen, setIsOpen] = React.useState(false);
  const [project, setProject] = React.useState(projects[0]);
  const [enabledSearches, setEnabledSearches] = React.useState([
    ...dropdownOptions,
  ]);
  const [shownProjects, setShownProjects] = React.useState([...projects]);
  const [search, setSearch] = React.useState("");

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  function openWith(data) {
    setProject(data);
    openModal();
  }

  const handleSearch = () => {
    setShownProjects([
      ...projects.filter((p) =>
        searchProject(
          enabledSearches.map((e) => e.value),
          search,
          p
        )
      ),
    ]);
  };

  const rowStyle = { width: "100%", cursor: "pointer" };

  const columns = [
    {
      name: <div style={{ fontWeight: 800 }}>title</div>,
      selector: (row) => (
        <div style={rowStyle} onClick={() => openWith(row)}>
          {row.title}
        </div>
      ),
      sortable: true,
    },
    {
      name: <div style={{ fontWeight: 800 }}>supervisor(s)</div>,
      selector: (row) => (
        <div style={rowStyle} onClick={() => openWith(row)}>
          {" "}
          {row.responsibles.map((t) => (
            <Supervisor t={t} />
          ))}{" "}
        </div>
      ),
      sortable: true,
    },
    {
      name: <div style={{ fontWeight: 800 }}>tags</div>,
      selector: (row) => (
        <div style={rowStyle} onClick={() => openWith(row)}>
          {row.tags.map((t) => (
            <Pill text={t.name} color={t.color} />
          ))}
        </div>
      ),
      sortable: true,
    },
  ];

  const displayBoxStyle = {
    color: "#929292",
  };

  return (
    <div
      className="App"
      id="main"
      style={{ width: "80%", marginLeft: "auto", marginRight: "auto" }}
    >
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={{
          content: {
            top: "10%",
            left: "10%",
            right: "10%",
            bottom: "auto",
          },
        }}
      >
        <div class="App">
          <h1>{project.title}</h1>
          <div style={{ fontSize: 14 }}>
            {project.tags.map((t) => (
              <Pill text={t.name} color={t.color} />
            ))}
          </div>
          <div style={{ marginTop: 20 }}>
            Supervisor(s):{" "}
            {project.responsibles.map((t) => (
              <Supervisor t={t} />
            ))}
          </div>
          <ReactMarkdown children={`${project.abstract}`} />
          <div style={{ backgroundColor: "#FAFAFA", padding: 20 }}>
            <div>
              Expected background:{" "}
              <span style={displayBoxStyle}>
                {project.education_background}
              </span>
            </div>
            <div>
              Expected competencies:{" "}
              <span style={displayBoxStyle}>
                {project.expected_competencies}
              </span>
            </div>
            <div>
              What you will learn:{" "}
              <span style={displayBoxStyle}>{project.outcome}</span>
            </div>
          </div>
          
        </div>
      </Modal>
      <div>
        <div
          style={{
            display: "flex",
            alignContent: "row",
            padding: 15,
            fontSize: 15,
          }}
        >
          <input
            style={{
              fontSize: 16,
              height: "2.25em",
              marginRight: 5,
              marginTop: 0,
              marginBottom: 1,
              border: "solid 1px #CACACA",
              borderRadius: 4,
            }}
            type="text"
            value={search}
            placeholder="Search..."
            onInput={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => (e.key === "Enter" ? handleSearch() : false)}
          />
          <span style={{ width: "10em" }}>
             <MultiSelect
              style={{ margin: 5 }}
              options={dropdownOptions}
              value={enabledSearches}
              onChange={setEnabledSearches}
            />
          </span>
          <input
            style={{
              fontSize: 16,
              height: "2.5em",
              marginLeft: 5,
              marginTop: 0,
              backgroundColor: "#FAFAFA",
              marginBottom: 1,
              border: "solid 1px #CACACA",
              borderRadius: 4,
              hover: {
                backgroundColor: "#BABABA",
              },
            }}
            type="button"
            onClick={handleSearch}
            value="search"
          />
        </div>
      </div>
      <DataTable columns={columns} data={shownProjects} pagination />
    </div>
  );
}

export default App;
