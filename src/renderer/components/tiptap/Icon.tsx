// @ts-nocheck

const Bold = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24"
      viewBox="0 -960 960 960"
      width="24"
      className="text-on-background fill-on-background"
    >
      <path d="M272-200v-560h221q65 0 120 40t55 111q0 51-23 78.5T602-491q25 11 55.5 41t30.5 90q0 89-65 124.5T501-200H272Zm121-112h104q48 0 58.5-24.5T566-372q0-11-10.5-35.5T494-432H393v120Zm0-228h93q33 0 48-17t15-38q0-24-17-39t-44-15h-95v109Z" />
    </svg>
  );
};

const Italic = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24"
      viewBox="0 -960 960 960"
      width="24"
      className="text-on-background fill-on-background"
    >
      <path d="M200-200v-100h160l120-360H320v-100h400v100H580L460-300h140v100H200Z" />
    </svg>
  );
};

const Paragraph = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24"
      viewBox="0 -960 960 960"
      width="24"
      className="text-on-background fill-on-background"
    >
      <path d="M360-160v-240q-83 0-141.5-58.5T160-600q0-83 58.5-141.5T360-800h360v80h-80v560h-80v-560H440v560h-80Z" />
    </svg>
  );
};

const List = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24"
      viewBox="0 -960 960 960"
      width="24"
      className="text-on-background fill-on-background"
    >
      <path d="M360-200v-80h480v80H360Zm0-240v-80h480v80H360Zm0-240v-80h480v80H360ZM200-160q-33 0-56.5-23.5T120-240q0-33 23.5-56.5T200-320q33 0 56.5 23.5T280-240q0 33-23.5 56.5T200-160Zm0-240q-33 0-56.5-23.5T120-480q0-33 23.5-56.5T200-560q33 0 56.5 23.5T280-480q0 33-23.5 56.5T200-400Zm0-240q-33 0-56.5-23.5T120-720q0-33 23.5-56.5T200-800q33 0 56.5 23.5T280-720q0 33-23.5 56.5T200-640Z" />
    </svg>
  );
};

const Table = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24"
      viewBox="0 -960 960 960"
      width="24"
      className="text-on-background fill-on-background"
    >
      <path d="M120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200q-33 0-56.5-23.5T120-200Zm80-400h560v-160H200v160Zm213 200h134v-120H413v120Zm0 200h134v-120H413v120ZM200-400h133v-120H200v120Zm427 0h133v-120H627v120ZM200-200h133v-120H200v120Zm427 0h133v-120H627v120Z" />
    </svg>
  );
};

const SmallX = () => {
  return (
    <span className="katex text-on-background">
      <span className="katex-mathml">
        <math xmlns="http://www.w3.org/1998/Math/MathML">
          <semantics>
            <mrow>
              <mi>x</mi>
            </mrow>
            <annotation>x</annotation>
          </semantics>
        </math>
      </span>
      <span className="katex-html" aria-hidden="true">
        <span className="base">
          <span className="strut" style={{ height: "0.4306em" }}></span>
          <span className="mord mathnormal">x</span>
        </span>
      </span>
    </span>
  );
};

const CapitalX = () => {
  return (
    <span className="katex text-on-background">
      <span className="katex-mathml">
        <math xmlns="http://www.w3.org/1998/Math/MathML">
          <semantics>
            <mrow>
              <mi>X</mi>
            </mrow>
            <annotation>X</annotation>
          </semantics>
        </math>
      </span>
      <span className="katex-html" aria-hidden="true">
        <span className="base">
          <span className="strut" style={{ height: "0.6833em" }}></span>
          <span
            className="mord mathnormal"
            style={{ marginRight: "0.07847em" }}
          >
            X
          </span>
        </span>
      </span>
    </span>
  );
};

const RowAfter = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      className="text-on-background fill-on-background"
    >
      <path
        fill="currentColor"
        d="M22 10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V3h2v2h4V3h2v2h4V3h2v2h4V3h2zM4 10h4V7H4zm6 0h4V7h-4zm10 0V7h-4v3zm-9 4h2v3h3v2h-3v3h-2v-3H8v-2h3z"
      />
    </svg>
  );
};

const RowBefore = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      className="text-on-background fill-on-background"
    >
      <path
        fill="currentColor"
        d="M22 14a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v7h2v-2h4v2h2v-2h4v2h2v-2h4v2h2zM4 14h4v3H4zm6 0h4v3h-4zm10 0v3h-4v-3zm-9-4h2V7h3V5h-3V2h-2v3H8v2h3z"
      />
    </svg>
  );
};

const DeleteRow = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      className="text-on-background fill-on-background"
    >
      <path
        fill="currentColor"
        d="M3.75 2a.75.75 0 0 0-.75.75v1A3.25 3.25 0 0 0 6.25 7h11.5A3.25 3.25 0 0 0 21 3.75v-1a.75.75 0 0 0-1.5 0v1a1.75 1.75 0 0 1-1.75 1.75H15.5V2.75a.75.75 0 0 0-1.5 0V5.5h-4V2.75a.75.75 0 0 0-1.5 0V5.5H6.25A1.75 1.75 0 0 1 4.5 3.75v-1A.75.75 0 0 0 3.75 2m0 20a.75.75 0 0 1-.75-.75v-1A3.25 3.25 0 0 1 6.25 17h11.5A3.25 3.25 0 0 1 21 20.25v1a.75.75 0 0 1-1.5 0v-1a1.75 1.75 0 0 0-1.75-1.75H15.5v2.75a.75.75 0 0 1-1.5 0V18.5h-4v2.75a.75.75 0 0 1-1.5 0V18.5H6.25a1.75 1.75 0 0 0-1.75 1.75v1a.75.75 0 0 1-.75.75M12 13.06l1.47 1.47a.75.75 0 1 0 1.06-1.06L13.06 12l1.47-1.47a.75.75 0 1 0-1.06-1.06L12 10.94l-1.47-1.47a.75.75 0 1 0-1.06 1.06L10.94 12l-1.47 1.47a.75.75 0 1 0 1.06 1.06zm-3.273-.31c.023-.026.047-.051.072-.076L9.473 12l-.674-.674a1.845 1.845 0 0 1-.072-.076H2.75a.75.75 0 0 0 0 1.5zm6.796 0h5.727a.75.75 0 0 0 0-1.5h-5.727a1.826 1.826 0 0 1-.072.076l-.674.674l.674.674z"
      />
    </svg>
  );
};

const ColumnAfter = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      className="text-on-background fill-on-background"
    >
      <path
        fill="currentColor"
        d="M11 2a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H2V2zm-7 8v4h7v-4zm0 6v4h7v-4zM4 4v4h7V4zm11 7h3V8h2v3h3v2h-3v3h-2v-3h-3z"
      />
    </svg>
  );
};

const ColumnBefore = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      className="text-on-background fill-on-background"
    >
      <path
        fill="currentColor"
        d="M13 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h9V2zm7 8v4h-7v-4zm0 6v4h-7v-4zm0-12v4h-7V4zM9 11H6V8H4v3H1v2h3v3h2v-3h3z"
      />
    </svg>
  );
};

const DeleteColumn = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      className="text-on-background fill-on-background"
    >
      <path
        fill="currentColor"
        d="M22 3.75a.75.75 0 0 0-.75-.75h-1A3.25 3.25 0 0 0 17 6.25v11.5A3.25 3.25 0 0 0 20.25 21h1a.75.75 0 0 0 0-1.5h-1a1.75 1.75 0 0 1-1.75-1.75V15.5h2.75a.75.75 0 0 0 0-1.5H18.5v-4h2.75a.75.75 0 0 0 0-1.5H18.5V6.25c0-.966.784-1.75 1.75-1.75h1a.75.75 0 0 0 .75-.75m-20 0A.75.75 0 0 1 2.75 3h1A3.25 3.25 0 0 1 7 6.25v11.5A3.25 3.25 0 0 1 3.75 21h-1a.75.75 0 0 1 0-1.5h1a1.75 1.75 0 0 0 1.75-1.75V15.5H2.75a.75.75 0 0 1 0-1.5H5.5v-4H2.75a.75.75 0 0 1 0-1.5H5.5V6.25A1.75 1.75 0 0 0 3.75 4.5h-1A.75.75 0 0 1 2 3.75M10.94 12l-1.47 1.47a.75.75 0 1 0 1.06 1.06L12 13.06l1.47 1.47a.75.75 0 1 0 1.06-1.06L13.06 12l1.47-1.47a.75.75 0 1 0-1.06-1.06L12 10.94l-1.47-1.47a.75.75 0 1 0-1.06 1.06zm.31-3.273c.026.023.051.047.076.072l.674.674l.674-.674c.025-.025.05-.049.076-.072V2.75a.75.75 0 0 0-1.5 0zm0 6.796v5.727a.75.75 0 0 0 1.5 0v-5.727a1.826 1.826 0 0 1-.076-.072L12 14.777l-.674.674z"
      />
    </svg>
  );
};

const DeleteTable = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 2048 2048"
      className="text-on-background fill-on-background"
    >
      <path
        fill="currentColor"
        d="m1819 1728l227 227l-91 90l-227-227l-227 227l-90-90l227-227l-227-227l91-90l226 226l227-226l90 90zm226 0l3-3v6zm3-1600v1152h-642l-126 126v-126H768v384h512v128H0V128zM640 1280H128v384h512zm0-512H128v384h512zm0-512H128v384h512zm640 512H768v384h512zm0-512H768v384h512zm640 512h-512v384h512zm0-512h-512v384h512z"
      />
    </svg>
  );
};

export {
  Bold,
  Italic,
  Paragraph,
  List,
  Table,
  SmallX,
  CapitalX,
  RowAfter,
  RowBefore,
  ColumnAfter,
  ColumnBefore,
  DeleteColumn,
  DeleteRow,
  DeleteTable,
};
