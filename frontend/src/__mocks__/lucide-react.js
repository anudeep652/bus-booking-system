const lucideReact = jest.requireActual("lucide-react");

module.exports = {
  ...lucideReact,
  Search: (props) => <svg data-testid="SearchIcon" {...props} />,
  MapPin: (props) => <svg data-testid="MapPinIcon" {...props} />,
  Bus: (props) => <svg data-testid="BusIcon" {...props} />,
  ArrowRight: (props) => <svg data-testid="ArrowRightIcon" {...props} />,
  FilterX: (props) => <svg data-testid="FilterXIcon" {...props} />,
  Star: (props) => <svg data-testid="StarIcon" {...props} />,
};
