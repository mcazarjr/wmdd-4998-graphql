import { FaPenToSquare, FaTrashCan } from "react-icons/fa6";
import { useMutation, useQuery } from "@apollo/client";
import {
  GET_CARS_OF_PERSON_BY_ID,
  GET_PEOPLE,
  REMOVE_PERSON,
  UPDATE_PERSON,
} from "../../graphql/queries";
import { Link } from "react-router-dom";
import IconButton from "../buttons/IconButton";
import CarCardItem from "./CarCardItem";
import { useState } from "react";
import PersonForm from "../forms/PersonForm";

const PersonCardItem = ({ id, firstName, lastName, people }) => {
  const [isEdit, setIsEdit] = useState(false);
  const [updatePerson] = useMutation(UPDATE_PERSON);

  const [removePerson] = useMutation(REMOVE_PERSON, {
    update: (cache, { data: { removePerson } }) => {
      const data = cache.readQuery({ query: GET_PEOPLE });

      //Optimistically Removed Person to People Property
      const people = data.people.filter(
        (person) => person.id !== removePerson.id
      );

      cache.writeQuery({
        query: GET_PEOPLE,
        data: { people },
      });
    },
  });

  const { loading, error, data } = useQuery(GET_CARS_OF_PERSON_BY_ID, {
    variables: { id: id },
  });

  const handleRemovePerson = () => {
    let result = window.confirm("Are you sure you want to delete this person?");

    if (result) {
      removePerson({
        variables: { id: id },
      });
    }
  };

  const handleEditPerson = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);

    try {
      updatePerson({
        variables: {
          id: id,
          firstName: data.get("firstName"),
          lastName: data.get("lastName"),
        },
        update: (cache, { data: { updatePerson } }) => {
          const data = cache.readQuery({ query: GET_PEOPLE });

          //Optimistically Updated Person to People Property
          const people = data.people.map((person) =>
            person.id === updatePerson.id ? updatePerson : person
          );

          cache.writeQuery({
            query: GET_PEOPLE,
            data: { people },
          });
        },
      });
    } catch (error) {
      console.log(error);
    } finally {
      setIsEdit(false);
    }
  };

  if (loading) return "Loading...";

  if (error) return `Error! ${error.message}`;

  return (
    <div className="p-4 border-2">
      {isEdit ? (
        <PersonForm
          btnTitle="Update User"
          firstName={firstName}
          lastName={lastName}
          onSubmit={handleEditPerson}
        />
      ) : (
        <header className="flex justify-between">
          <h3>
            {firstName} {lastName}
          </h3>

          <div className="flex gap-2 items-center">
            <Link to={`/person/${id}`}>
              <button className="uppercase text-blue-500">Learn More</button>
            </Link>

            <IconButton
              className="hover:text-gray-500"
              onClick={() => setIsEdit(true)}
            >
              <FaPenToSquare />
            </IconButton>

            <IconButton
              className="hover:text-red-500"
              onClick={handleRemovePerson}
            >
              <FaTrashCan />
            </IconButton>
          </div>
        </header>
      )}

      {data.carsOfPersonId.length > 0 ? (
        <div className="content p-4 mt-4">
          {data.carsOfPersonId.map((car) => (
            <CarCardItem
              key={car.id}
              id={car.id}
              make={car.make}
              model={car.model}
              year={car.year}
              price={car.price}
              personId={car.personId}
              people={people}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default PersonCardItem;
