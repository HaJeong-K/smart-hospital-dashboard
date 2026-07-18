function FloorSelector({

    floors,

    selectedFloor,

    onChange,

    variant,

}) {

    return (

        <div className={`floor-selector ${variant === "horizontal" ? "floor-selector--horizontal" : ""}`}>

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