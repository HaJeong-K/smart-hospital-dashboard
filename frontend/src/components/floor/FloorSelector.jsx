function FloorSelector({

    floors,

    selectedFloor,

    onChange,

}) {

    return (

        <div className="floor-selector">

            {

                floors.map((floor)=>(

                    <button

                        key={floor.id}

                        className={`floor-button ${
                            selectedFloor.id===floor.id
                                ? "active"
                                : ""
                        }`}

                        onClick={()=>onChange(floor)}

                    >

                        {floor.name}

                    </button>

                ))

            }

        </div>

    );

}

export default FloorSelector;