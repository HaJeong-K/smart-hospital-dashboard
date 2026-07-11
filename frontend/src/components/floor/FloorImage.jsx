function FloorImage({ floor }) {

    return (

        <image

            href={floor.floorMap.src}

            x="0"

            y="0"

            width="1000"

            height="700"

            preserveAspectRatio="none"

        />

    );

}

export default FloorImage;