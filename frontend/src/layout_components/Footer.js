function Footer() {
  return (
    <footer className="footer">
      <div className="card">
        <div className="card-body">
          <div className="d-sm-flex justify-content-center justify-content-sm-between py-2">
            <span className="text-muted text-center text-sm-left d-block d-sm-inline-block">
              Copyright ©{" "}
              <a href="https://www.bootstrapdash.com/" target="_blank">
                bootstrapdash.com{" "}
              </a>
              2021
            </span>
            <span className="float-none float-sm-right d-block mt-1 mt-sm-0 text-center">
              Only the best{" "}
              <a href="https://www.bootstrapdash.com/" target="_blank">
                {" "}
                Bootstrap dashboard{" "}
              </a>{" "}
              templates
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
