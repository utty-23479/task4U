import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Button,
  TablePagination,
  TableSortLabel,
} from "@mui/material";
import {
  LockClosedIcon,
  LockOpenIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  };
  return date.toLocaleString("en-US", options).replace(",", "");
};

export default function EnhancedTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("last_login_time");

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_API}api/users/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const formattedUsers = data.map((user) => ({
            ...user,
            id: user.id || user._id,
          }));
          setUsers(formattedUsers);
        } else if (response.status === 401) {
          console.error("Access denied. Redirecting to login...");
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      } catch (error) {
        console.error("Error fetching users: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleRequestSort = (property) => {
    const isAscending = orderBy === property && order === "asc";
    setOrder(isAscending ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedUsers = users.sort((a, b) => {
    if (orderBy === "last_login_time") {
      const dateA = new Date(a[orderBy]);
      const dateB = new Date(b[orderBy]);
      return order === "asc" ? dateA - dateB : dateB - dateA;
    }
    if (a[orderBy] < b[orderBy]) return order === "asc" ? -1 : 1;
    if (a[orderBy] > b[orderBy]) return order === "asc" ? 1 : -1;
    return 0;
  });

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = users.map((user) => user.id);
      setSelectedUsers(newSelecteds);
    } else {
      setSelectedUsers([]);
    }
  };

  const handleClick = (id) => {
    const selectedIndex = selectedUsers.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedUsers, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedUsers.slice(1));
    } else if (selectedIndex === selectedUsers.length - 1) {
      newSelected = newSelected.concat(selectedUsers.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedUsers.slice(0, selectedIndex),
        selectedUsers.slice(selectedIndex + 1),
      );
    }

    setSelectedUsers(newSelected);
  };

  const handleAction = async (action) => {
    if (selectedUsers.length === 0) {
      alert("Please select at least one user");
      return;
    }

    try {
      const url =
        action === "block"
          ? `${import.meta.env.VITE_API}api/users/block`
          : action === "unblock"
            ? `${import.meta.env.VITE_API}api/users/unblock`
            : `${import.meta.env.VITE_API}api/users`;

      const method = action === "delete" ? "DELETE" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedUsers }),
      });

      if (response.ok) {
        // const updatedUsers =
        //   action === "block"
        //     ? users.map((user) =>
        //         selectedUsers.includes(user.id)
        //           ? { ...user, status: "blocked" }
        //           : user,
        //       )
        const updatedUsers =
          action === "unblock"
            ? users.map((user) =>
                selectedUsers.includes(user.id)
                  ? { ...user, status: "active" }
                  : user,
              )
            : action === "unblock"
              ? users.map((user) =>
                  selectedUsers.includes(user.id)
                    ? { ...user, status: "active" }
                    : user,
                )
              : users.filter((user) => !selectedUsers.includes(user.id));

        setUsers(updatedUsers);
        setSelectedUsers([]);
        alert(`Users have been ${action === "delete" ? "deleted" : action}`);
      } else {
        alert(`Failed to ${action} users`);
      }
    } catch (error) {
      console.error(`Error during ${action} action:`, error);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (id) => selectedUsers.includes(id);

  return (
    <div>
      <div className="mb-4 flex">
        <Button
          variant="contained"
          sx={{
            backgroundColor: "blue",
            color: "white",
            "&:hover": {
              backgroundColor: "darkblue",
            },
          }}
          onClick={() => handleAction("block")}
          disabled={selectedUsers.length === 0}
        >
          Block
          <LockClosedIcon
            aria-hidden="true"
            className="inline size-5 ml-2 group-data-[open]:hidden"
          ></LockClosedIcon>
        </Button>
        <Button
          variant="contained"
          sx={{
            backgroundColor: "blue",
            color: "white",
            "&:hover": {
              backgroundColor: "darkblue",
            },
          }}
          onClick={() => handleAction("unblock")}
          disabled={selectedUsers.length === 0}
          style={{ margin: "0 8px" }}
        >
          <LockOpenIcon
            aria-hidden="true"
            className="block size-5 group-data-[open]:hidden "
          ></LockOpenIcon>
        </Button>
        <Button
          variant="contained"
          sx={{
            backgroundColor: "red",
            color: "white",
            "&:hover": {
              backgroundColor: "darkred",
            },
          }}
          className="text-red-500"
          onClick={() => handleAction("delete")}
          disabled={selectedUsers.length === 0}
        >
          <TrashIcon
            aria-hidden="true"
            className="block size-5 group-data-[open]:hidden "
          ></TrashIcon>
        </Button>
      </div>
      <Paper>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={
                          selectedUsers.length > 0 &&
                          selectedUsers.length < users.length
                        }
                        checked={
                          users.length > 0 &&
                          selectedUsers.length === users.length
                        }
                        onChange={handleSelectAllClick}
                      />
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === "name"}
                        direction={order}
                        onClick={() => handleRequestSort("name")}
                      >
                        Name
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === "email"}
                        direction={order}
                        onClick={() => handleRequestSort("email")}
                      >
                        Email
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === "last_login_time"}
                        direction={order}
                        onClick={() => handleRequestSort("last_login_time")}
                      >
                        Last Login
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === "status"}
                        direction={order}
                        onClick={() => handleRequestSort("status")}
                      >
                        Status
                      </TableSortLabel>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedUsers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((user) => {
                      const isItemSelected = isSelected(user.id);
                      return (
                        <TableRow
                          key={user.id}
                          hover
                          role="checkbox"
                          aria-checked={isItemSelected}
                          selected={isItemSelected}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={isItemSelected}
                              onChange={() => handleClick(user.id)}
                            />
                          </TableCell>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            {formatDate(user.last_login_time)}
                          </TableCell>
                          <TableCell>{user.status}</TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={users.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(event, newPage) => setPage(newPage)}
              onRowsPerPageChange={(event) =>
                setRowsPerPage(parseInt(event.target.value, 10))
              }
            />
          </>
        )}
      </Paper>
    </div>
  );
}
